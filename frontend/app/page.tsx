'use client'

import { FormEvent, useEffect, useState } from 'react'

const API_URL = 'https://appointment-booking-web-zj1z.onrender.com'

export default function Home() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [isBooking, setIsBooking] = useState(false)

  const [appointments, setAppointments] = useState<
    {
      id: number
      name: string
      date: string
      time: string
    }[]
  >([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    if (!date) {
      setAvailableSlots([])
      setTime('')
      return
    }

    fetch(`${API_URL}/appointments/available-slots?date=${date}`)
      .then((response) => response.json())
      .then((data) => {
        setAvailableSlots(data.available_slots)
        setTime('')
      })
      .catch((error) => {
        console.error('Error fetching available slots:', error)
        setAvailableSlots([])
      })
  }, [date])

  async function loadAppointments() {
    try {
      const response = await fetch(`${API_URL}/appointments`)
      const data = await response.json()

      setAppointments(data.appointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  async function cancelAppointment(id: number) {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      setMessage(data.message)

      if (response.ok) {
        loadAppointments()
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      setMessage('Unable to cancel the appointment.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage('')
    setIsBooking(true)

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          date,
          time,
        }),
      })

      const data = await response.json()

      setMessage(data.message)
      setMessageType(response.ok ? 'success' : 'error')

      if (response.ok && data.appointment) {
        setName('')
        setDate('')
        setTime('')
        setAvailableSlots([])

        loadAppointments()
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
     setMessage('Unable to connect to the booking server.')
     setMessageType('error')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Appointment Booking
          </p>

          <h1 className="mt-3 text-4xl font-bold">Book an Appointment</h1>

          <p className="mt-3 text-gray-600">
            Choose a date and time that works for you.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Appointment Date
              </label>
              <input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Appointment Time
              </label>

              <select
                id="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
                disabled={!date}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="" disabled>
                  {date ? 'Select a time' : 'Choose a date first'}
                </option>

                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isBooking}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBooking ? 'Booking...' : 'Book Appointment'}
            </button>

            {message && (
              <p
                className={`rounded-lg p-4 text-center text-sm ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>

        <section className="mx-auto mt-12 max-w-xl">
          <h2 className="text-2xl font-bold">Appointments</h2>

          <div className="mt-6 space-y-4">
            {isLoadingAppointments ? (
              <p className="text-gray-600">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-600">No appointments booked yet.</p>
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
                >
                  <h3 className="text-lg font-semibold">{appointment.name}</h3>

                  <p className="mt-2 text-gray-600">Date: {appointment.date}</p>

                  <p className="text-gray-600">Time: {appointment.time}</p>

                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Cancel Appointment
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
