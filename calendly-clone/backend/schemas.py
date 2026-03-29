from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import DayOfWeek, MeetingStatus
import re


# ── Event Types ───────────────────────────────────────────────
class EventTypeCreate(BaseModel):
    name:        str
    slug:        str
    duration:    int
    description: Optional[str] = None
    color:       Optional[str] = "#0069ff"

    @field_validator("slug")
    @classmethod
    def slug_valid(cls, v):
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError("Slug must be lowercase letters, numbers, or hyphens only")
        return v

    @field_validator("duration")
    @classmethod
    def duration_positive(cls, v):
        if v <= 0:
            raise ValueError("Duration must be a positive number")
        return v


class EventTypeUpdate(BaseModel):
    name:        Optional[str]  = None
    duration:    Optional[int]  = None
    description: Optional[str]  = None
    color:       Optional[str]  = None
    is_active:   Optional[bool] = None


class EventTypeResponse(BaseModel):
    id:          int
    name:        str
    slug:        str
    duration:    int
    description: Optional[str]
    color:       str
    is_active:   bool
    created_at:  datetime

    class Config:
        from_attributes = True


# ── Availability ──────────────────────────────────────────────
class AvailabilitySlotCreate(BaseModel):
    day_of_week: DayOfWeek
    start_time:  str
    end_time:    str
    is_active:   Optional[bool] = True


class AvailabilitySlotResponse(BaseModel):
    id:          int
    day_of_week: DayOfWeek
    start_time:  str
    end_time:    str
    is_active:   bool

    class Config:
        from_attributes = True


class AvailabilityScheduleResponse(BaseModel):
    id:         int
    name:       str
    timezone:   str
    is_default: bool
    slots:      List[AvailabilitySlotResponse]

    class Config:
        from_attributes = True


class AvailabilityUpdate(BaseModel):
    timezone: Optional[str]                      = None
    slots:    Optional[List[AvailabilitySlotCreate]] = None


class DateOverrideCreate(BaseModel):
    date:           str
    start_time:     Optional[str]  = None
    end_time:       Optional[str]  = None
    is_unavailable: Optional[bool] = False


class DateOverrideResponse(BaseModel):
    id:             int
    date:           str
    start_time:     Optional[str]
    end_time:       Optional[str]
    is_unavailable: bool

    class Config:
        from_attributes = True


# ── Bookings / Meetings ───────────────────────────────────────
class BookingCreate(BaseModel):
    invitee_name:  str
    invitee_email: EmailStr
    date:          str
    start_time:    str
    notes:         Optional[str] = None


class MeetingResponse(BaseModel):
    id:            int
    event_type_id: int
    event_type:    EventTypeResponse
    invitee_name:  str
    invitee_email: str
    date:          str
    start_time:    str
    end_time:      str
    status:        MeetingStatus
    notes:         Optional[str]
    created_at:    datetime

    class Config:
        from_attributes = True


class AvailableSlotsResponse(BaseModel):
    date:  str
    slots: List[str]   # ["HH:MM", ...]