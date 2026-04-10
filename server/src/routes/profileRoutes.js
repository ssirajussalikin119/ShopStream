const express = require('express');
const { getDashboard } = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);

module.exports = router;
