const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const upload = require('../utils/multer');

// ========== PUBLIC ROUTES (No authentication required) ==========

// 1. Authentication
router.post('/login', authController.login);

// 2. OTP Password Reset - MUST BE PUBLIC!
router.post('/forgot-password', authController.forgotPassword);     // Send OTP
router.post('/reset-password', authController.resetPassword);       // Verify OTP + Reset Password
router.post('/verify-otp', authController.verifyOTP);               // Verify OTP only (optional)

// 3. Public Profile Data
router.get('/public/superadmin', authController.getPublicSuperadmin);
router.get('/public/carousel', authController.getPublicCarousel);
router.get('/public/contact', authController.getPublicContactInfo);

// 4. Contact Form
router.post('/contact', authController.sendContactEmail);

// ========== PROTECTED ROUTES (Individual protection) ==========

// User profile routes - EACH PROTECTED INDIVIDUALLY
router.get('/me', authController.protect, authController.getMe);

router.patch(
  '/update-me',
  authController.protect,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'carousel', maxCount: 10 }
  ]),
  authController.updateMe
);

router.patch('/update-password', authController.protect, authController.updatePassword);

// Carousel update (superadmin only)
router.patch(
  '/update-carousel',
  authController.protect,
  authController.restrictTo('superadmin'),
  authController.updateCarousel
);

// ========== ADMIN ONLY ROUTES (Add as needed) ==========
// Example (uncomment and modify as needed):
// router.get('/admin/users', 
//   authController.protect, 
//   authController.restrictTo('superadmin'),
//   adminController.getAllUsers
// );

module.exports = router;