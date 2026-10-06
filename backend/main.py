import json
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
    "https://appointment-booking-web-liart.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AVAILABLE_SLOTS = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00"
]

class Appointment(BaseModel):
    name: str
    date: str
    time: str

def load_appointments():
    with open("appointments.json", "r") as file:
        return json.load(file)

def validate_date(date):
    try:
        datetime.strptime(date, "%Y-%m-%d")
        return True
    except ValueError:
        return False


@app.get("/")
def home():
    return {"message": "Appointment Booking API is running"}

@app.get("/appointments")
def get_appointments():
    appointments = load_appointments()

    return {
        "appointments": appointments
    }

@app.post("/appointments")
def create_appointment(appointment: Appointment):
    appointments = load_appointments()

    if not validate_date(appointment.date):
        return {
            "message": "Invalid date. Use YYYY-MM-DD format."
        }

    if appointment.time not in AVAILABLE_SLOTS:
        return {
            "message": "Invalid time slot."
        }

    for existing in appointments:
        if (
            existing["date"] == appointment.date
            and existing["time"] == appointment.time
        ):
            return {
                "message": "That time slot is already booked"
            }

    if appointments:
        new_id = max(item["id"] for item in appointments) + 1
    else:
        new_id = 1

    new_appointment = {
        "id": new_id,
        "name": appointment.name,
        "date": appointment.date,
        "time": appointment.time
    }

    appointments.append(new_appointment)

    with open("appointments.json", "w") as file:
        json.dump(appointments, file, indent=4)

    return {
        "message": "Appointment booked successfully",
        "appointment": new_appointment
    }

@app.get("/appointments/available-slots")
def get_available_slots(date: str):
    appointments = load_appointments()

    booked_times = []

    for appointment in appointments:
        if appointment["date"] == date:
            booked_times.append(appointment["time"])

    available_slots = []

    for slot in AVAILABLE_SLOTS:
        if slot not in booked_times:
            available_slots.append(slot)

    return {
        "date": date,
        "available_slots": available_slots
    }

@app.delete("/appointments/{appointment_id}")
def cancel_appointment(appointment_id: int):
    appointments = load_appointments()

    for appointment in appointments:
        if appointment["id"] == appointment_id:
            appointments.remove(appointment)

            with open("appointments.json", "w") as file:
                json.dump(appointments, file, indent=4)

            return {
                "message": "Appointment cancelled successfully",
                "appointment": appointment
            }

    return {
        "message": "Appointment not found"
    }