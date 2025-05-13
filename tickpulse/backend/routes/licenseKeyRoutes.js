const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLicenseKey, updateLicenseKey } = require('../controllers/licenseKeyController');

// License Key Routes
router.get('/', protect, getLicenseKey); 
router.put('/', protect, updateLicenseKey); 

module.exports = router;