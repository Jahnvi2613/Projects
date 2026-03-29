from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import (
    EventType, Meeting, AvailabilitySchedule,
    AvailabilitySlot, DateOverride, MeetingStatus
)
from schemas import BookingCreate, MeetingResponse, AvailableSlotsResponse
from datetime import datetime, date
from typing import List

router = APIRouter()

DAY_MAP = {0:"monday",1:"tuesday",2:"wednesday",3:"thursday",4:"friday",5:"saturday",6:"sunday"}

def _t2m(t: str) -> int:
    h, m = map(int, t.split(":"))
    return h * 60 + m

def _m2t(mins: int) -> str:
    return f"{mins//60:02d}:{mins%60:02d}"


def _get_slots(db: Session, slug: str, date_str: str) -> List[str]:
    event = db.query(EventType).filter(
        EventType.slug == slug, EventType.is_active == True
    ).first()
    if not event:
        raise HTTPException(404, "Event type not found")

    try:
        target = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(400, "Invalid date format, use YYYY-MM-DD")

    if target < date.today():
        return []

    schedule = db.query(AvailabilitySchedule).filter(
        AvailabilitySchedule.is_default == True
    ).first()
    if not schedule:
        return []

    # Date override takes priority
    override = db.query(DateOverride).filter(DateOverride.date == date_str).first()
    if override and override.is_unavailable:
        return []
    if override and override.start_time and override.end_time:
        day_start = _t2m(override.start_time)
        day_end   = _t2m(override.end_time)
    else:
        day_name = DAY_MAP[target.weekday()]
        slot = db.query(AvailabilitySlot).filter(
            AvailabilitySlot.schedule_id == schedule.id,
            AvailabilitySlot.day_of_week == day_name,
            AvailabilitySlot.is_active   == True
        ).first()
        if not slot:
            return []
        day_start = _t2m(slot.start_time)
        day_end   = _t2m(slot.end_time)

    # All confirmed meetings on this date (across all event types) → block those windows
    booked = db.query(Meeting).filter(
        Meeting.date   == date_str,
        Meeting.status == MeetingStatus.confirmed
    ).all()
    booked_ranges = [(_t2m(m.start_time), _t2m(m.end_time)) for m in booked]

    available = []
    cur = day_start
    while cur + event.duration <= day_end:
        end = cur + event.duration
        if all(end <= bs or cur >= be for bs, be in booked_ranges):
            available.append(_m2t(cur))
        cur += 30   # 30-minute increments
    return available


@router.get("/{slug}/slots", response_model=AvailableSlotsResponse)
def get_slots(slug: str, date: str, db: Session = Depends(get_db)):
    return AvailableSlotsResponse(date=date, slots=_get_slots(db, slug, date))


@router.post("/{slug}/book", response_model=MeetingResponse, status_code=201)
def book(slug: str, payload: BookingCreate, db: Session = Depends(get_db)):
    event = db.query(EventType).filter(
        EventType.slug == slug, EventType.is_active == True
    ).first()
    if not event:
        raise HTTPException(404, "Event type not found")

    if payload.start_time not in _get_slots(db, slug, payload.date):
        raise HTTPException(409, "This time slot is no longer available")

    end = _m2t(_t2m(payload.start_time) + event.duration)
    meeting = Meeting(
        event_type_id=event.id,
        invitee_name=payload.invitee_name,
        invitee_email=payload.invitee_email,
        date=payload.date,
        start_time=payload.start_time,
        end_time=end,
        notes=payload.notes,
        status=MeetingStatus.confirmed,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting