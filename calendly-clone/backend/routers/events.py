from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import EventType
from schemas import EventTypeCreate, EventTypeUpdate, EventTypeResponse
from typing import List

router = APIRouter()


@router.get("/", response_model=List[EventTypeResponse])
def list_active(db: Session = Depends(get_db)):
    return db.query(EventType).filter(EventType.is_active == True).all()


@router.get("/all", response_model=List[EventTypeResponse])
def list_all(db: Session = Depends(get_db)):
    return db.query(EventType).all()


@router.get("/slug/{slug}", response_model=EventTypeResponse)
def get_by_slug(slug: str, db: Session = Depends(get_db)):
    et = db.query(EventType).filter(EventType.slug == slug, EventType.is_active == True).first()
    if not et:
        raise HTTPException(404, "Event type not found")
    return et


@router.get("/{event_id}", response_model=EventTypeResponse)
def get_by_id(event_id: int, db: Session = Depends(get_db)):
    et = db.query(EventType).filter(EventType.id == event_id).first()
    if not et:
        raise HTTPException(404, "Event type not found")
    return et


@router.post("/", response_model=EventTypeResponse, status_code=status.HTTP_201_CREATED)
def create(payload: EventTypeCreate, db: Session = Depends(get_db)):
    if db.query(EventType).filter(EventType.slug == payload.slug).first():
        raise HTTPException(400, "Slug already exists")
    et = EventType(**payload.model_dump())
    db.add(et)
    db.commit()
    db.refresh(et)
    return et


@router.put("/{event_id}", response_model=EventTypeResponse)
def update(event_id: int, payload: EventTypeUpdate, db: Session = Depends(get_db)):
    et = db.query(EventType).filter(EventType.id == event_id).first()
    if not et:
        raise HTTPException(404, "Event type not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(et, k, v)
    db.commit()
    db.refresh(et)
    return et


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(event_id: int, db: Session = Depends(get_db)):
    et = db.query(EventType).filter(EventType.id == event_id).first()
    if not et:
        raise HTTPException(404, "Event type not found")
    db.delete(et)
    db.commit()