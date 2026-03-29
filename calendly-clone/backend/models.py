from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class DayOfWeek(str, enum.Enum):
    monday    = "monday"
    tuesday   = "tuesday"
    wednesday = "wednesday"
    thursday  = "thursday"
    friday    = "friday"
    saturday  = "saturday"
    sunday    = "sunday"


class MeetingStatus(str, enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"


class EventType(Base):
    __tablename__ = "event_types"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(255), nullable=False)
    slug        = Column(String(255), unique=True, nullable=False, index=True)
    duration    = Column(Integer, nullable=False)          # minutes
    description = Column(Text, nullable=True)
    color       = Column(String(10), default="#0069ff")
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    meetings = relationship("Meeting", back_populates="event_type", cascade="all, delete-orphan")


class AvailabilitySchedule(Base):
    __tablename__ = "availability_schedules"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), default="Working Hours")
    timezone   = Column(String(100), default="Asia/Kolkata")
    is_default = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    slots = relationship("AvailabilitySlot", back_populates="schedule", cascade="all, delete-orphan")


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id          = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("availability_schedules.id"), nullable=False)
    day_of_week = Column(Enum(DayOfWeek), nullable=False)
    start_time  = Column(String(5), nullable=False)   # "HH:MM"
    end_time    = Column(String(5), nullable=False)
    is_active   = Column(Boolean, default=True)

    schedule = relationship("AvailabilitySchedule", back_populates="slots")


class DateOverride(Base):
    __tablename__ = "date_overrides"

    id             = Column(Integer, primary_key=True, index=True)
    date           = Column(String(10), nullable=False)   # "YYYY-MM-DD"
    start_time     = Column(String(5), nullable=True)
    end_time       = Column(String(5), nullable=True)
    is_unavailable = Column(Boolean, default=False)


class Meeting(Base):
    __tablename__ = "meetings"

    id             = Column(Integer, primary_key=True, index=True)
    event_type_id  = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    invitee_name   = Column(String(255), nullable=False)
    invitee_email  = Column(String(255), nullable=False)
    date           = Column(String(10), nullable=False)   # "YYYY-MM-DD"
    start_time     = Column(String(5),  nullable=False)   # "HH:MM"
    end_time       = Column(String(5),  nullable=False)
    status         = Column(Enum(MeetingStatus), default=MeetingStatus.confirmed)
    notes          = Column(Text, nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    event_type = relationship("EventType", back_populates="meetings")