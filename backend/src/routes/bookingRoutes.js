const express = require('express');
const { bookSeats, getAvailableSeats } = require('../controllers/bookingController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/seats', getAvailableSeats);
router.post('/book', auth, bookSeats);

module.exports = router;