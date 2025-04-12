const pool = require('../config/db');
const z = require('zod');

const bookingSchema = z.object({
  seats: z.array(z.number().int().positive()).min(1).max(7),
});

exports.getAvailableSeats = async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT seat_number, row_number, is_booked FROM seats ORDER BY row_number, seat_number'
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };

  exports.bookSeats = async (req, res) => {
    try {
      const { seats } = bookingSchema.parse(req.body);
      const userId = req.user.id;
  
      // Check if seats are available (not booked by anyone)
      const seatCheck = await pool.query(
        'SELECT seat_number FROM seats WHERE seat_number = ANY($1) AND is_booked = FALSE',
        [seats]
      );
  
      if (seatCheck.rows.length !== seats.length) {
        return res.status(400).json({ error: 'Some seats are already booked' });
      }
  
      // Check for existing bookings by this user
      const existingBookings = await pool.query(
        'SELECT s.seat_number FROM bookings b JOIN seats s ON b.seat_id = s.id WHERE b.user_id = $1 AND s.seat_number = ANY($2)',
        [userId, seats]
      );
  
      if (existingBookings.rows.length > 0) {
        const bookedSeatNumbers = existingBookings.rows.map((row) => row.seat_number);
        return res.status(400).json({
          error: `You have already booked seats: ${bookedSeatNumbers.join(', ')}`,
        });
      }
  
      // Book the seats
      await pool.query('BEGIN');
      for (const seatNum of seats) {
        const seatResult = await pool.query('SELECT id FROM seats WHERE seat_number = $1', [seatNum]);
        const seatId = seatResult.rows[0].id;
        await pool.query(
          'INSERT INTO bookings (user_id, seat_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, seatId]
        );
        await pool.query('UPDATE seats SET is_booked = TRUE WHERE seat_number = $1', [seatNum]);
      }
      await pool.query('COMMIT');
  
      res.json({ message: 'Seats booked successfully', seats });
    } catch (error) {
      await pool.query('ROLLBACK');
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error.code === '23505') {
        res.status(400).json({ error: 'Duplicate booking detected' });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  };