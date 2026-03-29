from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Meeting, MeetingStatus
from schemas import MeetingResponse
from datetime import date
from typing import List

router = APIRouter()


@router.get("/upcoming", response_model=List[MeetingResponse])
def upcoming(db: Session = Depends(get_db)):
    today = date.today().isoformat()
    return (
        db.query(Meeting)
        .filter(Meeting.date >= today, Meeting.status == MeetingStatus.confirmed)
        .order_by(Meeting.date, Meeting.start_time)
        .all()
    )


@router.get("/past", response_model=List[MeetingResponse])
def past(db: Session = Depends(get_db)):
    today = date.today().isoformat()
    return (
        db.query(Meeting)
        .filter(Meeting.date < today)
        .order_by(Meeting.date.desc(), Meeting.start_time.desc())
        .all()
    )


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_one(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(404, "Meeting not found")
    return m


@router.patch("/{meeting_id}/cancel", response_model=MeetingResponse)
def cancel(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(404, "Meeting not found")
    if m.status == MeetingStatus.cancelled:
        raise HTTPException(400, "Already cancelled")
    m.status = MeetingStatus.cancelled
    db.commit()
    db.refresh(m)
    return m