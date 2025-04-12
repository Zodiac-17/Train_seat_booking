'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define the Seat interface
interface Seat {
  seat_number: number;
  row_number: number;
  is_booked: boolean;
}

export default function Dashboard() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const router = useRouter();

  // Fetch all seats on mount
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await axios.get<Seat[]>(`${process.env.NEXT_PUBLIC_API_URL}/bookings/seats`);
        setSeats(res.data);
      } catch (error) {
        toast.error('Failed to fetch seats');
      }
    };
    fetchSeats();
  }, []);

  // Handle individual seat selection
  const handleSeatSelect = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((num) => num !== seatNumber));
    } else {
      if (selectedSeats.length < 7) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        toast.warning('Cannot select more than 7 seats');
      }
    }
  };

  // Book selected seats
  const handleBook = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat');
      return;
    }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/book`,
        { seats: selectedSeats },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Seats booked successfully');
      setSelectedSeats([]);
      const res = await axios.get<Seat[]>(`${process.env.NEXT_PUBLIC_API_URL}/bookings/seats`);
      setSeats(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Booking failed');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Train Seat Reservation</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {seats.map((seat: Seat) => (
          <button
            key={seat.seat_number}
            onClick={() => handleSeatSelect(seat.seat_number)}
            className={`p-4 rounded text-center ${
              seat.is_booked
                ? 'bg-red-500 text-white cursor-not-allowed'
                : selectedSeats.includes(seat.seat_number)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={seat.is_booked}
          >
            Seat {seat.seat_number} (Row {seat.row_number})
          </button>
        ))}
      </div>
      <div className="mt-6">
        <p>Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
        <button
          onClick={handleBook}
          className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Book Selected Seats
        </button>
      </div>
    </div>
  );
}