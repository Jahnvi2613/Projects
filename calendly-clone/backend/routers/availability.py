from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import AvailabilitySchedule, AvailabilitySlot, DateOverride
from schemas import (
    AvailabilityScheduleResponse, AvailabilityUpdate,
    DateOverrideCreate, DateOverrideResponse
)
from typing import List

router = APIRouter()


def _get_schedule(db: Session) -> AvailabilitySchedule:
    s = db.query(AvailabilitySchedule).filter(AvailabilitySchedule.is_default == True).first()
    if not s:
        s = AvailabilitySchedule(name="Working Hours", timezone="Asia/Kolkata")
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("/", response_model=AvailabilityScheduleResponse)
def get_availability(db: Session = Depends(get_db)):
    return _get_schedule(db)


@router.put("/", response_model=AvailabilityScheduleResponse)
def update_availability(payload: AvailabilityUpdate, db: Session = Depends(get_db)):
    s = _get_schedule(db)

    if payload.timezone:
        s.timezone = payload.timezone

    if payload.slots is not None:
        db.query(AvailabilitySlot).filter(AvailabilitySlot.schedule_id == s.id).delete()
        for slot_data in payload.slots:
            db.add(AvailabilitySlot(schedule_id=s.id, **slot_data.model_dump()))

    db.commit()
    db.refresh(s)
    return s


@router.get("/overrides", response_model=List[DateOverrideResponse])
def list_overrides(db: Session = Depends(get_db)):
    return db.query(DateOverride).all()


@router.post("/overrides", response_model=DateOverrideResponse)
def create_override(payload: DateOverrideCreate, db: Session = Depends(get_db)):
    o = DateOverride(**payload.model_dump())
    db.add(o)
    db.commit()
    db.refresh(o)
    return o


@router.delete("/overrides/{oid}", status_code=204)
def delete_override(oid: int, db: Session = Depends(get_db)):
    o = db.query(DateOverride).filter(DateOverride.id == oid).first()
    if not o:
        raise HTTPException(404, "Override not found")
    db.delete(o)
    db.commit()