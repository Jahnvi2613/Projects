from database import SessionLocal
from models import (
    EventType, AvailabilitySchedule, AvailabilitySlot,
    Meeting, DayOfWeek, MeetingStatus
)
from datetime import date, timedelta


def seed_data():
    db = SessionLocal()
    try:
        if db.query(EventType).count() > 0:
            return  # Already seeded — skip

        # ── Event Types ───────────────────────────────────────
        events = [
            EventType(name="15 Minute Meeting",  slug="15min",         duration=15,  color="#0069ff",
                      description="A quick sync to touch base."),
            EventType(name="30 Minute Meeting",  slug="30min",         duration=30,  color="#00a2ff",
                      description="A standard meeting for most discussions."),
            EventType(name="60 Minute Meeting",  slug="60min",         duration=60,  color="#ff5722",
                      description="An in-depth session for complex topics."),
            EventType(name="Technical Interview", slug="tech-interview", duration=45, color="#9c27b0",
                      description="45-minute technical interview session."),
        ]
        db.add_all(events)
        db.flush()   # get IDs without committing

        # ── Availability Schedule (Mon–Fri 9AM–5PM) ───────────
        schedule = AvailabilitySchedule(
            name="Working Hours", timezone="Asia/Kolkata", is_default=True
        )
        db.add(schedule)
        db.flush()

        for day in [DayOfWeek.monday, DayOfWeek.tuesday, DayOfWeek.wednesday,
                    DayOfWeek.thursday, DayOfWeek.friday]:
            db.add(AvailabilitySlot(
                schedule_id=schedule.id,
                day_of_week=day,
                start_time="09:00",
                end_time="17:00",
                is_active=True
            ))

        # ── Sample Meetings ───────────────────────────────────
        today = date.today()
        upcoming = [
            Meeting(event_type_id=events[1].id, invitee_name="Alice Johnson",
                    invitee_email="alice@example.com",
                    date=(today + timedelta(days=1)).isoformat(),
                    start_time="10:00", end_time="10:30",
                    status=MeetingStatus.confirmed, notes="Discuss Q1 roadmap"),

            Meeting(event_type_id=events[1].id, invitee_name="Bob Smith",
                    invitee_email="bob@example.com",
                    date=(today + timedelta(days=2)).isoformat(),
                    start_time="14:00", end_time="14:30",
                    status=MeetingStatus.confirmed),

            Meeting(event_type_id=events[2].id, invitee_name="Carol White",
                    invitee_email="carol@example.com",
                    date=(today + timedelta(days=4)).isoformat(),
                    start_time="11:00", end_time="12:00",
                    status=MeetingStatus.confirmed, notes="System design review"),
        ]
        past = [
            Meeting(event_type_id=events[0].id, invitee_name="David Lee",
                    invitee_email="david@example.com",
                    date=(today - timedelta(days=3)).isoformat(),
                    start_time="09:00", end_time="09:15",
                    status=MeetingStatus.confirmed),

            Meeting(event_type_id=events[1].id, invitee_name="Eve Brown",
                    invitee_email="eve@example.com",
                    date=(today - timedelta(days=7)).isoformat(),
                    start_time="15:00", end_time="15:30",
                    status=MeetingStatus.cancelled),
        ]

        db.add_all(upcoming + past)
        db.commit()
        print("✅ Database seeded successfully")

    except Exception as e:
        db.rollback()
        print(f"⚠️  Seed skipped: {e}")
    finally:
        db.close()
