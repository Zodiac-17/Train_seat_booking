# Train Reservation System

A full-stack web application for reserving train seats, featuring user authentication, seat booking with consecutive/nearby seat prioritization, and a responsive UI. Built with a Node.js (Express) backend, a Next.js (React with TypeScript) frontend, and a PostgreSQL database.

## Features
- **User Authentication**: Sign up and log in with email/password, secured with JWT.
- **Seat Booking**: Book up to 7 seats, prioritizing consecutive seats in one row or nearby seats if unavailable.
- **Responsive Dashboard**: Displays all seats—available (gray), selected (blue), and booked (red)—using Tailwind CSS.
- **Persistent Storage**: PostgreSQL database stores users, seats, and bookings.
- **Real-time Updates**: Seat status updates dynamically after booking.

## Project Structure
train-reservation-system/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API logic (userController.js, bookingController.js)
│   │   ├── models/         # (Empty, schema in SQL)
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication middleware (auth.js)
│   │   ├── config/         # Database config (db.js)
│   │   └── utils/          # Utility functions (if any)
│   ├── .env               # Environment variables (not tracked)
│   ├── package.json       # Backend dependencies
│   └── server.js          # Express server entry point
├── frontend/
│   ├── app/
│   │   ├── api/           # (Empty, for future API routes)
│   │   ├── components/    # (Empty, for reusable components)
│   │   ├── styles/
│   │   │   └── globals.css # Global Tailwind CSS styles
│   │   ├── lib/           # (Empty, for utilities)
│   │   ├── login/
│   │   │   └── page.tsx   # Login page
│   │   ├── signup/
│   │   │   └── page.tsx   # Signup page
│   │   ├── dashboard/
│   │   │   └── page.tsx   # Dashboard with seat booking
│   │   ├── page.tsx       # Root redirect page
│   │   ├── layout.tsx     # Root layout with metadata and toast
│   ├── public/            # Static assets
│   ├── .env.local         # Frontend environment variables (not tracked)
│   ├── next.config.js     # Next.js configuration
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── postcss.config.js  # PostCSS configuration for Tailwind
├── README.md              # This file
└── .gitignore             # Git ignore rules

text

Collapse

Wrap

Copy

## Prerequisites
- **Node.js**: v18 or later ([Download](https://nodejs.org/))
- **PostgreSQL**: v16 or later ([Download](https://www.postgresql.org/download/))
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/train-reservation-system.git
cd train-reservation-system
Replace <your-username> with your GitHub username.

2. Backend Setup
Navigate to Backend:
bash

Collapse

Wrap

Copy
cd backend
Install Dependencies:
bash

Collapse

Wrap

Copy
npm install
Configure Environment:
Create a .env file in backend/:
text

Collapse

Wrap

Copy
DATABASE_URL=postgresql://postgres:<your_password>@localhost:5432/train_reservation?schema=public
JWT_SECRET=<your_jwt_secret>
Replace <your_password> with your PostgreSQL password (set during installation).
Replace <your_jwt_secret> with a secure string (e.g., mysecretkey123).
Set Up PostgreSQL:
Ensure PostgreSQL is running (e.g., via services.msc on Windows or pg_ctl on other systems).
Open a terminal and connect:
bash

Collapse

Wrap

Copy
psql -U postgres
Create the database and tables:
sql

Collapse

Wrap

Copy
CREATE DATABASE train_reservation;
\c train_reservation
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    seat_number INTEGER UNIQUE NOT NULL,
    row_number INTEGER NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE
);
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    seat_id INTEGER REFERENCES seats(id),
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, seat_id)
);
DO $$  
BEGIN
    FOR row IN 1..11 LOOP
        FOR seat IN 1..7 LOOP
            INSERT INTO seats (seat_number, row_number, is_booked)
            VALUES ((row - 1) * 7 + seat, row, FALSE);
        END LOOP;
    END LOOP;
    INSERT INTO seats (seat_number, row_number, is_booked)
    VALUES (78, 12, FALSE), (79, 12, FALSE), (80, 12, FALSE);
END   $$;
\q
Start the Backend:
bash

Collapse

Wrap

Copy
npm run dev
Runs on http://localhost:5000.
3. Frontend Setup
Navigate to Frontend:
bash

Collapse

Wrap

Copy
cd ../frontend
Install Dependencies:
bash

Collapse

Wrap

Copy
npm install
Configure Environment:
Create a .env.local file in frontend/:
text

Collapse

Wrap

Copy
NEXT_PUBLIC_API_URL=http://localhost:5000/api
Start the Frontend:
bash

Collapse

Wrap

Copy
npm run dev
Runs on http://localhost:3000.
4. Usage
Open http://localhost:3000 in your browser.
Sign Up: Create an account with an email and password.
Log In: Access the dashboard.
Book Seats: Enter a number (1-7) to book consecutive or nearby seats.
View Dashboard: Available seats (gray), selected seats (blue), booked seats (red).
API Documentation
Base URL
http://localhost:5000/api

Endpoints
1. User Signup
Method: POST
URL: /users/signup
Request Body:
json

Collapse

Wrap

Copy
{
  "email": "user@example.com",
  "password": "password123"
}
Response (201):
json

Collapse

Wrap

Copy
{
  "user": { "id": 1, "email": "user@example.com" },
  "token": "<jwt_token>"
}
Error (400):
json

Collapse

Wrap

Copy
{ "error": "Email already exists" }
2. User Login
Method: POST
URL: /users/login
Request Body:
json

Collapse

Wrap

Copy
{
  "email": "user@example.com",
  "password": "password123"
}
Response (200):
json

Collapse

Wrap

Copy
{
  "user": { "id": 1, "email": "user@example.com" },
  "token": "<jwt_token>"
}
Error (401):
json

Collapse

Wrap

Copy
{ "error": "Invalid credentials" }
3. Get All Seats
Method: GET
URL: /bookings/seats
Response (200):
json

Collapse

Wrap

Copy
[
  { "seat_number": 1, "row_number": 1, "is_booked": false },
  { "seat_number": 2, "row_number": 1, "is_booked": true },
  ...
]
Error (500):
json

Collapse

Wrap

Copy
{ "error": "Server error" }
4. Book Seats
Method: POST
URL: /bookings/book
Headers: Authorization: Bearer <jwt_token>
Request Body:
json

Collapse

Wrap

Copy
{ "seats": [1, 2, 3] }
Response (200):
json

Collapse

Wrap

Copy
{ "message": "Seats booked successfully", "seats": [1, 2, 3] }
Error (400):
json

Collapse

Wrap

Copy
{ "error": "Some seats are already booked" }
or
json

Collapse

Wrap

Copy
{ "error": "You have already booked seats: 1, 2" }