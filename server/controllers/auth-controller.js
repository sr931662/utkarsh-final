const User = require('../db/userSchema');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const sendEmail = require('../utils/email');
const { sendOTPEmail } = require('../utils/aws-ses');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const { filterObj } = require('../utils/helpers');
const nodemailer = require('nodemailer');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) Check if user is approved
    if (!user.isApproved) {
      return next(
        new AppError('Your account is pending approval by admin', 403)
      );
    }

    // 4) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Example Nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER, // tumhara official email
      subject: `Contact Form: ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Message sent successfully!',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'There was an error sending the message. Please try again later.',
      stack: err, // debug ke liye
    });
  }
};


// Add these methods to auth-controller.js

exports.getPublicCarousel = async (req, res, next) => {
  try {
    const superadmin = await User.findOne({ role: 'superadmin', isApproved: true })
      .select('carouselItems');
    
    if (!superadmin) {
      return next(new AppError('No carousel data available', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        carouselItems: superadmin.carouselItems || []
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCarousel = async (req, res, next) => {
  try {
    const { carouselItems } = req.body;

    // Validate input
    if (!Array.isArray(carouselItems)) {
      return next(new AppError('Invalid carousel data format', 400));
    }

    // Update carousel items with proper order
    const updatedItems = carouselItems.map((item, index) => ({
      ...item,
      order: index,
      isActive: item.isActive !== false // Default to true if not specified
    }));

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { carouselItems: updatedItems },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getPublicContactInfo = async (req, res, next) => {
  try {
    const superadmin = await User.findOne({ role: 'superadmin', isApproved: true })
      .select('name email phoneNumber alternateEmail affiliation.location affiliation.officeHours socialMedia');
    
    if (!superadmin) {
      return next(new AppError('No public contact information available', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: superadmin
      }
    });
  } catch (err) {
    next(err);
  }
};
// Then add this controller method to auth-controller.js:
exports.getPublicSuperadmin = async (req, res, next) => {
  try {
    const superadmin = await User.findOne({ role: 'superadmin', isApproved: true })
      .select('-password -passwordResetToken -passwordResetExpires -passwordChangedAt -passwordResetOTP -otpExpires');
    
    if (!superadmin) {
      return next(new AppError('No superadmin profile found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: superadmin
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    // 5) Check if account is approved
    if (!currentUser.isApproved) {
      return next(
        new AppError('Your account is not yet approved. Please contact administrator.', 403)
      );
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
/**
 * FORGOT PASSWORD - Send OTP via AWS SES
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError('Please provide email address', 400));
    }

    console.log("📧 Forgot password request for:", email);

    // 1) Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // 2) For security, always return success even if user doesn't exist
    if (!user) {
      console.log("⚠️ User not found, but returning success for security");
      return res.status(200).json({
        status: 'success',
        message: 'If the email exists, an OTP has been sent'
      });
    }

    // 3) Generate and save OTP (uses your schema's createOTP method)
    const rawOTP = user.createOTP(); // This returns the raw OTP
    await user.save({ validateBeforeSave: false });
    
    console.log(`🔑 Generated OTP for ${user.email}:`, rawOTP);

    // 4) Send OTP via AWS SES
    try {
      await sendOTPEmail(user.email, rawOTP);
      
      res.status(200).json({
        status: 'success',
        message: 'OTP has been sent to your email'
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      
      // 5) Clear OTP if email fails
      user.clearOTP();
      await user.save({ validateBeforeSave: false });
      
      return next(new AppError('Failed to send OTP email. Please try again.', 500));
    }
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    next(err);
  }
};

/**
 * RESET PASSWORD - Verify OTP and update password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1) Validate input
    if (!email || !otp || !newPassword) {
      return next(new AppError('Please provide email, OTP and new password', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters', 400));
    }

    console.log("🔄 Reset password attempt for:", email);

    // 2) Get user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('Invalid email or OTP', 400));
    }

    // 3) Verify OTP (uses your schema's verifyOTP method)
    if (!user.verifyOTP(otp)) {
      console.log("❌ OTP verification failed for:", email);
      return next(new AppError('Invalid or expired OTP', 400));
    }

    console.log("✅ OTP verified for:", email);

    // 4) Update password
    user.password = newPassword; // Will be hashed by pre-save middleware
    user.passwordChangedAt = Date.now();
    user.clearOTP(); // Clear OTP after successful reset
    
    await user.save();

    console.log("✅ Password updated for:", email);

    // 5) Log the user in automatically (optional)
    createSendToken(user, 200, res);
    
  } catch (err) {
    console.error('❌ Reset password error:', err);
    next(err);
  }
};


exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};


// auth-controller.js - Update updateMe function
exports.updateMe = async (req, res, next) => {
  try {
    console.log('=== UPDATE ME REQUEST ===');
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    console.log('User ID:', req.user.id);

    // 1) Prevent password updates here
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password updates. Please use /update-password.', 400));
    }

    // 2) Handle file uploads
    const fileFields = {};
    
    // Handle profile image
    if (req.files && req.files['profileImage']) {
      console.log('Profile image file:', req.files['profileImage'][0]);
      const profileImage = req.files['profileImage'][0];
      fileFields.profileImage = `/uploads/${profileImage.filename}`;
    }

    // Handle carousel images
    let carouselImageMap = {};
    if (req.files && req.files['carousel']) {
      console.log('Carousel files:', req.files['carousel']);
      req.files['carousel'].forEach((file, index) => {
        carouselImageMap[index] = `/uploads/${file.filename}`;
      });
    }

    // 3) Parse JSON fields with better error handling
    const parseJSONField = (field, fieldName) => {
      if (!field) return undefined;
      
      try {
        return typeof field === 'string' ? JSON.parse(field) : field;
      } catch (err) {
        console.log(`Failed to parse ${fieldName}:`, field);
        return undefined; // Return undefined instead of the raw string
      }
    };
    
    // 4) Filter and prepare update data
    const filteredBody = {
      ...req.body,
      ...fileFields
    };

    // Only add fields if they exist and are valid
    const fieldsToParse = [
      'socialMedia', 'affiliation', 'location', 'education', 
      'workExperience', 'awards', 'researchInterests', 'teachingInterests',
      'skills', 'technicalSkills', 'languages', 'hobbies', 
      'certificates', 'notificationPreferences', 'carouselItems'
    ];

    fieldsToParse.forEach(field => {
      const parsed = parseJSONField(req.body[field], field);
      if (parsed !== undefined) {
        filteredBody[field] = parsed;
      }
    });

    // 5) Process carousel items - update image URLs for uploaded files
    if (filteredBody.carouselItems && Array.isArray(filteredBody.carouselItems)) {
      console.log('Processing carousel items:', filteredBody.carouselItems);
      filteredBody.carouselItems = filteredBody.carouselItems.map((item, index) => {
        // If we have a new carousel image for this index, update the URL
        if (carouselImageMap[index]) {
          console.log(`Updating carousel item ${index} with image:`, carouselImageMap[index]);
          return {
            ...item,
            imageUrl: carouselImageMap[index]
          };
        }
        return item;
      });
    }

    // 6) Clean up undefined fields
    Object.keys(filteredBody).forEach(key => {
      if (filteredBody[key] === undefined) {
        delete filteredBody[key];
      }
    });

    console.log('Final update data:', JSON.stringify(filteredBody, null, 2));

    // 7) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      filteredBody, 
      {
        new: true,
        runValidators: true
      }
    );

    console.log('Update successful:', updatedUser);

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    console.error('Update error details:', err);
    console.error('Error stack:', err.stack);
    next(err);
  }
};

/**
 * VERIFY OTP ONLY (without resetting password)
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError('Please provide email and OTP', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.verifyOTP(otp)) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully',
      data: { verified: true }
    });
  } catch (err) {
    next(err);
  }
};


// exports.updateMe = async (req, res, next) => {
//   try {
//     console.log('Received update request with files:', req.files);
//     console.log('Received update request with body:', req.body);

//     // 1) Prevent password updates here
//     if (req.body.password || req.body.passwordConfirm) {
//       return next(new AppError('This route is not for password updates. Please use /update-password.', 400));
//     }

//     // 2) Handle file uploads
//     const fileFields = {};
    
//     // Handle profile image
//     if (req.files && req.files['profileImage']) {
//       const profileImage = req.files['profileImage'][0];
//       fileFields.profileImage = `/uploads/${profileImage.filename}`;
//     }

//     // Handle carousel images
//     let carouselImageMap = {};
//     if (req.files && req.files['carousel']) {
//       req.files['carousel'].forEach((file, index) => {
//         carouselImageMap[index] = `/uploads/${file.filename}`;
//       });
//     }

//     // 3) Parse JSON fields
//     const parseJSONField = (field) => {
//       try {
//         return typeof field === 'string' ? JSON.parse(field) : field;
//       } catch (err) {
//         console.log(`Failed to parse field: ${field}`);
//         return field;
//       }
//     };
    
//     // 4) Filter and prepare update data
//     const filteredBody = {
//       ...req.body,
//       ...fileFields,
//       socialMedia: parseJSONField(req.body.socialMedia),
//       affiliation: parseJSONField(req.body.affiliation),
//       location: parseJSONField(req.body.location),
//       education: parseJSONField(req.body.education),
//       workExperience: parseJSONField(req.body.workExperience),
//       awards: parseJSONField(req.body.awards),
//       researchInterests: parseJSONField(req.body.researchInterests),
//       teachingInterests: parseJSONField(req.body.teachingInterests),
//       skills: parseJSONField(req.body.skills),
//       technicalSkills: parseJSONField(req.body.technicalSkills),
//       languages: parseJSONField(req.body.languages),
//       hobbies: parseJSONField(req.body.hobbies),
//       certificates: parseJSONField(req.body.certificates),
//       notificationPreferences: parseJSONField(req.body.notificationPreferences),
//       carouselItems: parseJSONField(req.body.carouselItems)
//     };

//     // 5) Process carousel items - update image URLs for uploaded files
//     if (filteredBody.carouselItems && Array.isArray(filteredBody.carouselItems)) {
//       filteredBody.carouselItems = filteredBody.carouselItems.map((item, index) => {
//         // If we have a new carousel image for this index, update the URL
//         if (carouselImageMap[index]) {
//           return {
//             ...item,
//             imageUrl: carouselImageMap[index]
//           };
//         }
//         return item;
//       });
//     }

//     // 6) Clean up undefined fields
//     Object.keys(filteredBody).forEach(key => {
//       if (filteredBody[key] === undefined) {
//         delete filteredBody[key];
//       }
//     });

//     console.log('Final update data:', filteredBody);

//     // 7) Update user document
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: updatedUser
//       }
//     });
//   } catch (err) {
//     console.error('Update error:', err);
//     next(err);
//   }
// };


// exports.updateMe = async (req, res, next) => {
//   try {
//     console.log('Received update request with:', req.body, req.file);
//     // ... rest of the function
//     // 1) Prevent password updates here
//     if (req.body.password || req.body.passwordConfirm) {
//       return next(new AppError('This route is not for password updates. Please use /update-password.', 400));
//     }

//     // 2) Handle file uploads
//     const fileFields = {};
//     if (req.file) {
//       // Determine which type of file was uploaded
//       if (req.file.fieldname === 'profileImage') {
//         fileFields.profileImage = `/uploads/${req.file.filename}`;
//       } else if (req.file.fieldname === 'carouselImage') {
//         // This will be handled in the carouselItems processing
//       }
//     }

//     // 3) Parse JSON fields
//     const parseJSONField = (field) => {
//       try {
//         return typeof field === 'string' ? JSON.parse(field) : field;
//       } catch (err) {
//         return field;
//       }
//     };
    
//     // 4) Filter and prepare update data
//     const filteredBody = {
//       ...req.body,
//       ...fileFields,
//       socialMedia: parseJSONField(req.body.socialMedia),
//       affiliation: parseJSONField(req.body.affiliation),
//       location: parseJSONField(req.body.location),
//       education: parseJSONField(req.body.education),
//       workExperience: parseJSONField(req.body.workExperience),
//       awards: parseJSONField(req.body.awards),
//       researchInterests: parseJSONField(req.body.researchInterests),
//       teachingInterests: parseJSONField(req.body.teachingInterests),
//       skills: parseJSONField(req.body.skills),
//       technicalSkills: parseJSONField(req.body.technicalSkills),
//       languages: parseJSONField(req.body.languages),
//       hobbies: parseJSONField(req.body.hobbies),
//       certificates: parseJSONField(req.body.certificates),
//       notificationPreferences: parseJSONField(req.body.notificationPreferences),
//       carouselItems: parseJSONField(req.body.carouselItems)
//     };

//     // 5) Process carousel items if they exist
//     if (filteredBody.carouselItems && Array.isArray(filteredBody.carouselItems)) {
//       filteredBody.carouselItems = filteredBody.carouselItems.map(item => ({
//         ...item,
//         // If we have a new carousel image file, update the URL
//         imageUrl: req.file?.fieldname === 'carouselImage' 
//           ? `/uploads/${req.file.filename}` 
//           : item.imageUrl
//       }));
//     }

//     // 6) Update user document
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: updatedUser
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.updateMe = async (req, res, next) => {
//   try {
//     // 1) Prevent password updates here
//     if (req.body.password || req.body.passwordConfirm) {
//       return next(
//         new AppError(
//           'This route is not for password updates. Please use /update-password.',
//           400
//         )
//       );
//     }

//     // 2) Parse JSON fields if they come stringified (from FormData)
//     const parseJSONField = (field) => {
//       try {
//         return typeof field === 'string' ? JSON.parse(field) : field;
//       } catch (err) {
//         return field; // fallback if parsing fails
//       }
//     };

//     // 3) Manually filter allowed fields
//     const filteredBody = {
//       name: req.body.name,
//       email: req.body.email,
//       professionalTitle: req.body.professionalTitle,
//       gender: req.body.gender,
//       dateOfBirth: req.body.dateOfBirth,
//       phoneNumber: req.body.phoneNumber,
//       alternateEmail: req.body.alternateEmail,
//       bio: req.body.bio,
//       socialMedia: parseJSONField(req.body.socialMedia),
//       affiliation: parseJSONField(req.body.affiliation),
//       location: parseJSONField(req.body.location),
//       education: parseJSONField(req.body.education),
//       workExperience: parseJSONField(req.body.workExperience),
//       awards: parseJSONField(req.body.awards),
//       researchInterests: parseJSONField(req.body.researchInterests),
//       teachingInterests: parseJSONField(req.body.teachingInterests),
//       skills: parseJSONField(req.body.skills),
//       technicalSkills: parseJSONField(req.body.technicalSkills),
//       languages: parseJSONField(req.body.languages),
//       hobbies: parseJSONField(req.body.hobbies),
//       certificates: parseJSONField(req.body.certificates),
//       notificationPreferences: parseJSONField(req.body.notificationPreferences),
//       carouselItems: parseJSONField(req.body.carouselItems)   // ✅ added carousel here
//     };

//     // 4) Handle file upload if present
//     if (req.file) {
//       filteredBody.profileImage = req.file.path;
//     }

//     // 5) Update user document
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: updatedUser
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// };






















// exports.updateMe = async (req, res, next) => {
//   try {
//     // If user is not superadmin, they can only update their own profile
//     if (req.user.role !== 'superadmin') {
//       return next(
//         new AppError('You do not have permission to update this profile', 403)
//       );
//     }

//     // Filter out unwanted fields
//     const filteredBody = filterObj(req.body, 'name', 'email', /* other allowed fields */);
    
//     // Handle file upload if needed
//     if (req.file) {
//       filteredBody.profileImage = req.file.path;
//     }

//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: updatedUser
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// exports.updateMe = async (req, res, next) => {
//   try {
//     // Filter out unwanted fields that are not allowed to be updated
//     const filteredBody = { ...req.body };
    
//     // Handle file upload for profile image if needed
//     if (req.file) {
//       filteredBody.profileImage = req.file.path;
//     }

//     // Update user document
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: updatedUser,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };









// exports.forgotPassword = async (req, res, next) => {
//   try {
//     // 1) Get user based on POSTed email
//     const user = await User.findOne({ email: req.body.email });
    
//     // 2) If user doesn't exist, still return success to prevent email enumeration
//     if (!user) {
//       return res.status(200).json({
//         status: 'success',
//         message: 'If the email exists, an OTP has been sent',
//       });
//     }

//     // 3) Generate the random OTP
//     const otp = user.createOTP();
//     await user.save({ validateBeforeSave: false });

//     // 4) Send it to user's email
//     const message = `Your password reset OTP is ${otp}. This OTP is valid for 10 minutes.`;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: 'Your password reset OTP (valid for 10 min)',
//         message,
//       });

//       res.status(200).json({
//         status: 'success',
//         message: 'If the email exists, an OTP has been sent',
//       });
//     } catch (err) {
//       user.passwordResetOTP = undefined;
//       user.otpExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return next(
//         new AppError('There was an error sending the email. Try again later!'),
//         500
//       );
//     }
//   } catch (err) {
//     next(err);
//   }
// };

// exports.resetPassword = async (req, res, next) => {
//   try {
//     // 1) Get user based on the email
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return next(new AppError('User not found', 404));
//     }

//     // 2) Verify OTP
//     if (!user.verifyOTP(req.body.otp)) {
//       return next(new AppError('Invalid or expired OTP', 400));
//     }

//     // 3) Update password
//     user.password = req.body.newPassword;
//     user.passwordResetOTP = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     // 4) Log the user in, send JWT
//     createSendToken(user, 200, res);
//   } catch (err) {
//     next(err);
//   }
// };













































// // // const User = require('../db/userSchema');
// // // const jwt = require('jsonwebtoken');
// // // const bcrypt = require('bcryptjs');
// // // const crypto = require('crypto');
// // // const sendEmail = require('../utils/email');

// // // // Helper function to create token
// // // const signToken = (id, role) => {
// // //   return jwt.sign({ id, role }, process.env.JWT_SECRET, {
// // //     expiresIn: process.env.JWT_EXPIRES_IN,
// // //   });
// // // };

// // // // Helper function to create and send token
// // // const createSendToken = (user, statusCode, res) => {
// // //   const token = signToken(user._id, user.role);
// // //   const cookieOptions = {
// // //     expires: new Date(
// // //       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
// // //     ),
// // //     httpOnly: true,
// // //     secure: process.env.NODE_ENV === 'production',
// // //   };

// // //   res.cookie('jwt', token, cookieOptions);
// // //   user.password = undefined;

// // //   res.status(statusCode).json({
// // //     status: 'success',
// // //     token,
// // //     data: {
// // //       user,
// // //     },
// // //   });
// // // };

// // // // Login controller
// // // exports.login = async (req, res, next) => {
// // //   try {
// // //     const { email, password } = req.body;

// // //     if (!email || !password) {
// // //       return res.status(400).json({
// // //         status: 'fail',
// // //         message: 'Please provide email and password',
// // //       });
// // //     }

// // //     const user = await User.findOne({ email }).select('+password');

// // //     if (!user || !(await bcrypt.compare(password, user.password))) {
// // //       return res.status(401).json({
// // //         status: 'fail',
// // //         message: 'Incorrect email or password',
// // //       });
// // //     }

// // //     if (!user.isApproved) {
// // //       return res.status(403).json({
// // //         status: 'fail',
// // //         message: 'Account not approved. Please contact superadmin.',
// // //       });
// // //     }

// // //     createSendToken(user, 200, res);
// // //   } catch (err) {
// // //     res.status(500).json({
// // //       status: 'error',
// // //       message: 'Something went wrong',
// // //       error: err.message,
// // //     });
// // //   }
// // // };

// // // // Forgot password controller
// // // exports.forgotPassword = async (req, res, next) => {
// // //   try {
// // //     const user = await User.findOne({ email: req.body.email });
// // //     if (!user) {
// // //       return res.status(404).json({
// // //         status: 'fail',
// // //         message: 'There is no user with that email address.',
// // //       });
// // //     }

// // //     const resetToken = crypto.randomBytes(32).toString('hex');
// // //     user.passwordResetToken = crypto
// // //       .createHash('sha256')
// // //       .update(resetToken)
// // //       .digest('hex');
// // //     user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
// // //     await user.save({ validateBeforeSave: false });

// // //     const resetURL = `${req.protocol}://${req.get(
// // //       'host'
// // //     )}/api/auth/resetPassword/${resetToken}`;

// // //     const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

// // //     try {
// // //       await sendEmail({
// // //         email: user.email,
// // //         subject: 'Your password reset token (valid for 10 min)',
// // //         message,
// // //       });

// // //       res.status(200).json({
// // //         status: 'success',
// // //         message: 'Token sent to email!',
// // //       });
// // //     } catch (err) {
// // //       user.passwordResetToken = undefined;
// // //       user.passwordResetExpires = undefined;
// // //       await user.save({ validateBeforeSave: false });

// // //       return res.status(500).json({
// // //         status: 'error',
// // //         message: 'There was an error sending the email. Try again later!',
// // //       });
// // //     }
// // //   } catch (err) {
// // //     res.status(500).json({
// // //       status: 'error',
// // //       message: 'Something went wrong',
// // //       error: err.message,
// // //     });
// // //   }
// // // };

// // // // Get current user
// // // exports.getMe = async (req, res, next) => {
// // //   try {
// // //     const user = await User.findById(req.user.id).select('-password');
// // //     res.status(200).json({
// // //       status: 'success',
// // //       data: {
// // //         user
// // //       }
// // //     });
// // //   } catch (err) {
// // //     next(err);
// // //   }
// // // };

// // // // Reset password controller
// // // exports.resetPassword = async (req, res, next) => {
// // //   try {
// // //     const hashedToken = crypto
// // //       .createHash('sha256')
// // //       .update(req.params.token)
// // //       .digest('hex');

// // //     const user = await User.findOne({
// // //       passwordResetToken: hashedToken,
// // //       passwordResetExpires: { $gt: Date.now() },
// // //     });

// // //     if (!user) {
// // //       return res.status(400).json({
// // //         status: 'fail',
// // //         message: 'Token is invalid or has expired',
// // //       });
// // //     }

// // //     user.password = await bcrypt.hash(req.body.password, 12);
// // //     user.passwordResetToken = undefined;
// // //     user.passwordResetExpires = undefined;
// // //     await user.save();

// // //     createSendToken(user, 200, res);
// // //   } catch (err) {
// // //     res.status(500).json({
// // //       status: 'error',
// // //       message: 'Something went wrong',
// // //       error: err.message,
// // //     });
// // //   }
// // // };

// // // // Refresh token controller
// // // exports.refreshToken = async (req, res, next) => {
// // //   try {
// // //     const token = req.headers.authorization?.split(' ')[1];
// // //     if (!token) {
// // //       return res.status(401).json({
// // //         status: 'fail',
// // //         message: 'No token provided',
// // //       });
// // //     }

// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     const newToken = signToken(decoded.id, decoded.role);
    
// // //     res.status(200).json({
// // //       status: 'success',
// // //       token: newToken,
// // //     });
// // //   } catch (err) {
// // //     res.status(401).json({
// // //       status: 'fail',
// // //       message: 'Invalid or expired token',
// // //     });
// // //   }
// // // };
























// // const User = require('../db/userSchema');
// // const jwt = require('jsonwebtoken');
// // const bcrypt = require('bcryptjs');
// // const crypto = require('crypto');
// // const sendEmail = require('../utils/email');

// // // Helper function to create token
// // const signToken = (id, role) => {
// //   return jwt.sign({ id, role }, process.env.JWT_SECRET, {
// //     expiresIn: process.env.JWT_EXPIRES_IN,
// //   });
// // };

// // // Helper function to create and send token
// // const createSendToken = (user, statusCode, res) => {
// //   const token = signToken(user._id, user.role);
// //   const cookieOptions = {
// //     expires: new Date(
// //       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
// //     ),
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV === 'production',
// //   };

// //   res.cookie('jwt', token, cookieOptions);
  
// //   // Remove sensitive data from output
// //   user.password = undefined;
// //   user.passwordResetToken = undefined;
// //   user.passwordResetExpires = undefined;

// //   res.status(statusCode).json({
// //     status: 'success',
// //     token,
// //     data: {
// //       user,
// //     },
// //   });
// // };

// // // Login controller
// // exports.login = async (req, res, next) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (!email || !password) {
// //       return res.status(400).json({
// //         status: 'fail',
// //         message: 'Please provide email and password',
// //       });
// //     }

// //     const user = await User.findOne({ email }).select('+password');

// //     if (!user || !(await user.comparePassword(password))) {
// //       return res.status(401).json({
// //         status: 'fail',
// //         message: 'Incorrect email or password',
// //       });
// //     }

// //     if (!user.isApproved) {
// //       return res.status(403).json({
// //         status: 'fail',
// //         message: 'Account not approved. Please contact superadmin.',
// //       });
// //     }

// //     // Update last active timestamp
// //     user.lastActive = Date.now();
// //     await user.save({ validateBeforeSave: false });

// //     createSendToken(user, 200, res);
// //   } catch (err) {
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Something went wrong',
// //       error: err.message,
// //     });
// //   }
// // };


// // // Check email existence
// // exports.checkEmail = async (req, res, next) => {
// //   try {
// //     const { email } = req.body;
    
// //     if (!email) {
// //       return res.status(400).json({
// //         status: 'fail',
// //         message: 'Please provide an email address'
// //       });
// //     }

// //     const user = await User.findOne({ email });
    
// //     res.status(200).json({
// //       status: 'success',
// //       exists: !!user // Returns true if user exists, false otherwise
// //     });
    
// //   } catch (err) {
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Something went wrong',
// //       error: err.message
// //     });
// //   }
// // };
// // // OTP Controller
// // exports.sendOTP = async (req, res) => {
// //   try {
// //     const { email } = req.body;
    
// //     // 1. Check if user exists
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       return res.status(404).json({
// //         status: 'fail',
// //         message: 'No user found with that email'
// //       });
// //     }

// //     // 2. Generate and save OTP
// //     const otp = user.createOTP();
// //     await user.save({ validateBeforeSave: false });

// //     // 3. Send OTP via EmailJS
// //     try {
// //       await emailjs.send(
// //         process.env.EMAILJS_SERVICE_ID,
// //         process.env.EMAILJS_TEMPLATE_ID,
// //         {
// //           to_email: user.email,
// //           otp_code: otp,
// //           expiration: "10 minutes"
// //         },
// //         process.env.EMAILJS_PUBLIC_KEY
// //       );

// //       res.status(200).json({
// //         status: 'success',
// //         message: 'OTP sent successfully'
// //       });
// //     } catch (err) {
// //       user.clearOTP();
// //       await user.save({ validateBeforeSave: false });
      
// //       return res.status(500).json({
// //         status: 'error',
// //         message: 'Failed to send OTP email'
// //       });
// //     }
// //   } catch (err) {
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Something went wrong'
// //     });
// //   }
// // };

// // // Verify OTP and Reset Password
// // exports.verifyOTPAndResetPassword = async (req, res) => {
// //   try {
// //     const { email, otp, newPassword } = req.body;
    
// //     // 1. Get user
// //     const user = await User.findOne({ email }).select('+passwordResetOTP');
// //     if (!user) {
// //       return res.status(404).json({
// //         status: 'fail',
// //         message: 'No user found with that email'
// //       });
// //     }

// //     // 2. Verify OTP
// //     if (!user.verifyOTP(otp)) {
// //       return res.status(400).json({
// //         status: 'fail',
// //         message: 'Invalid or expired OTP'
// //       });
// //     }

// //     // 3. Update password
// //     user.password = newPassword;
// //     user.passwordChangedAt = Date.now();
// //     user.clearOTP();
// //     await user.save();

// //     // 4. Log the user in (optional)
// //     createSendToken(user, 200, res);
// //   } catch (err) {
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Something went wrong'
// //     });
// //   }
// // };
// // // Forgot password controller
// // // In auth-controller.js, update the forgotPassword controller:
// // exports.forgotPassword = async (req, res, next) => {
// //   try {
// //     const user = await User.findOne({ email: req.body.email });
// //     if (!user) {
// //       return res.status(404).json({
// //         status: 'fail',
// //         message: 'There is no user with that email address.',
// //       });
// //     }

// //     const resetToken = user.createPasswordResetToken();
// //     await user.save({ validateBeforeSave: false });

// //     // Use frontend URL instead of API URL
// //     const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

// //     try {
// //       // Use the Email class
// //       const email = new Email(user, resetURL);
// //       await email.sendPasswordReset();

// //       res.status(200).json({
// //         status: 'success',
// //         message: 'Token sent to email!',
// //       });
// //     } catch (err) {
// //       user.passwordResetToken = undefined;
// //       user.passwordResetExpires = undefined;
// //       await user.save({ validateBeforeSave: false });

// //       return res.status(500).json({
// //         status: 'error',
// //         message: 'There was an error sending the email. Try again later!',
// //         error: err.message // Added for debugging
// //       });
// //     }
// //   } catch (err) {
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Something went wrong',
// //       error: err.message // Added for debugging
// //     });
// //   }
// // };

// // // Get current user
// // exports.getMe = async (req, res, next) => {
// //   try {
// //     const user = await User.findById(req.user.id)
// //       .select('-password -passwordResetToken -passwordResetExpires');
    
// //     res.status(200).json({
// //       status: 'success',
// //       data: {
// //         user
// //       }
// //     });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// // // Reset password controller
// // exports.resetPassword = async (req, res, next) => {
// //   try {
// //     const hashedToken = crypto
// //       .createHash('sha256')
// //       .update(req.params.token)
// //       .digest('hex');

// //     const user = await User.findOne({
// //       passwordResetToken: hashedToken,
// //       passwordResetExpires: { $gt: Date.now() },
// //     });

// //     if (!user) {
// //       return res.status(400).json({
// //         status: 'fail',
// //         message: 'Token is invalid or has expired',
// //       });
// //     }

// //     user.password = req.body.password;
// //     user.passwordResetToken = undefined;
// //     user.passwordResetExpires = undefined;
// //     user.passwordChangedAt = Date.now();
// //     await user.save();

// //     createSendToken(user, 200, res);
// //   } catch (err) {
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Something went wrong',
// //       error: err.message,
// //     });
// //   }
// // };

// // // Update password controller
// // exports.updatePassword = async (req, res, next) => {
// //   try {
// //     const user = await User.findById(req.user.id).select('+password');

// //     if (!(await user.comparePassword(req.body.currentPassword))) {
// //       return res.status(401).json({
// //         status: 'fail',
// //         message: 'Your current password is wrong',
// //       });
// //     }

// //     user.password = req.body.newPassword;
// //     user.passwordChangedAt = Date.now();
// //     await user.save();

// //     createSendToken(user, 200, res);
// //   } catch (err) {
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Something went wrong',
// //       error: err,
// //     });
// //   }
// // };

// // // Refresh token controller
// // exports.refreshToken = async (req, res, next) => {
// //   try {
// //     const token = req.headers.authorization?.split(' ')[1];
// //     if (!token) {
// //       return res.status(401).json({
// //         status: 'fail',
// //         message: 'No token provided',
// //       });
// //     }

// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
// //     // Check if user still exists
// //     const currentUser = await User.findById(decoded.id);
// //     if (!currentUser) {
// //       return res.status(401).json({
// //         status: 'fail',
// //         message: 'The user belonging to this token no longer exists',
// //       });
// //     }

// //     // Check if user changed password after the token was issued
// //     if (currentUser.changedPasswordAfter(decoded.iat)) {
// //       return res.status(401).json({
// //         status: 'fail',
// //         message: 'User recently changed password! Please log in again',
// //       });
// //     }

// //     const newToken = signToken(decoded.id, decoded.role);
    
// //     res.status(200).json({
// //       status: 'success',
// //       token: newToken,
// //     });
// //   } catch (err) {
// //     res.status(401).json({
// //       status: 'fail',
// //       message: 'Invalid or expired token',
// //     });
// //   }
// // };



// const User = require('../db/userSchema');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');
// const { sendOTPEmail } = require('../utils/otpService'); // Optional modularization

// // Create JWT
// const signToken = (id, role) => {
//   return jwt.sign({ id, role }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// // Send token in response
// const createSendToken = (user, statusCode, res) => {
//   const token = signToken(user._id, user.role);
//   const cookieOptions = {
//     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//   };

//   res.cookie('jwt', token, cookieOptions);
//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: { user },
//   });
// };

// // LOGIN
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ status: 'fail', message: 'Email and password are required.' });

//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !(await user.comparePassword(password)))
//       return res.status(401).json({ status: 'fail', message: 'Incorrect email or password.' });

//     if (!user.isApproved)
//       return res.status(403).json({ status: 'fail', message: 'Account not approved. Contact admin.' });

//     // Update last active timestamp
//     user.lastActive = Date.now();
//     await user.save({ validateBeforeSave: false });

//     console.log('User before token creation:', user); // Debug log
    
//     createSendToken(user, 200, res);
//   } catch (err) {
//     console.error('Login error:', err); // Debug log
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// };
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     if (!email || !password)
// //       return res.status(400).json({ status: 'fail', message: 'Email and password are required.' });

// //     const user = await User.findOne({ email }).select('+password');
// //     if (!user || !(await user.comparePassword(password)))
// //       return res.status(401).json({ status: 'fail', message: 'Incorrect email or password.' });

// //     if (!user.isApproved)
// //       return res.status(403).json({ status: 'fail', message: 'Account not approved. Contact admin.' });

// //     user.lastActive = Date.now();
// //     await user.save({ validateBeforeSave: false });

// //     createSendToken(user, 200, res);
// //   } catch (err) {
// //     res.status(500).json({ status: 'error', message: 'Server error' });
// //   }
// // };

// exports.checkEmail = async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (user) {
//     return res.status(200).json({ status: 'success', exists: true });
//   } else {
//     return res.status(404).json({ status: 'fail', exists: false });
//   }
// };



// // SEND OTP
// exports.sendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user)
//       return res.status(404).json({ status: 'fail', message: 'User not found with that email.' });

//     const otp = user.createOTP();
//     await user.save({ validateBeforeSave: false });

//     try {
//       await sendOTPEmail(email, otp); // or replace with inline EmailJS code
//       res.status(200).json({ status: 'success', message: 'OTP sent to email' });
//     } catch {
//       user.clearOTP();
//       await user.save({ validateBeforeSave: false });
//       res.status(500).json({ status: 'error', message: 'Failed to send OTP email' });
//     }
//   } catch {
//     res.status(500).json({ status: 'error', message: 'Internal server error' });
//   }
// };

// // VERIFY OTP + RESET PASSWORD
// exports.verifyOTPAndResetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     const user = await User.findOne({ email }).select('+passwordResetOTP +password');
//     if (!user)
//       return res.status(404).json({ status: 'fail', message: 'No user found with that email.' });

//     if (!user.verifyOTP(otp))
//       return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP.' });

//     user.password = newPassword;
//     user.passwordChangedAt = Date.now();
//     user.clearOTP();
//     await user.save();

//     res.status(200).json({ status: 'success', message: 'Password reset successfully.' });
//   } catch {
//     res.status(500).json({ status: 'error', message: 'Failed to reset password' });
//   }
// };

// // GET ME
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires');
//     res.status(200).json({ status: 'success', user });

//   } catch {
//     res.status(500).json({ status: 'error', message: 'Failed to retrieve user' });
//   }
// };

// // UPDATE PASSWORD (protected)
// exports.updatePassword = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('+password');
//     if (!(await user.comparePassword(req.body.currentPassword)))
//       return res.status(401).json({ status: 'fail', message: 'Current password is incorrect.' });

//     user.password = req.body.newPassword;
//     user.passwordChangedAt = Date.now();
//     await user.save();

//     createSendToken(user, 200, res);
//   } catch {
//     res.status(500).json({ status: 'error', message: 'Failed to update password' });
//   }
// };

// // REFRESH TOKEN
// exports.refreshToken = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token)
//       return res.status(401).json({ status: 'fail', message: 'Token missing' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user)
//       return res.status(401).json({ status: 'fail', message: 'User does not exist' });

//     if (user.changedPasswordAfter(decoded.iat))
//       return res.status(401).json({ status: 'fail', message: 'Password changed after login. Re-login required.' });

//     const newToken = signToken(user.id, user.role);
//     res.status(200).json({ status: 'success', token: newToken });
//   } catch {
//     res.status(401).json({ status: 'fail', message: 'Invalid or expired token' });
//   }
// };
// // Add this to auth-controller.js
// // auth-controller.js
// exports.updateMe = async (req, res) => {
//   try {
//     // Filter out fields that shouldn't be updated
//     const filteredBody = { ...req.body };
//     const excludedFields = ['password', 'role', 'isApproved', 'createdBy'];
//     excludedFields.forEach(field => delete filteredBody[field]);
    
//     // Convert string dates to Date objects if needed
//     if (filteredBody.dateOfBirth) {
//       filteredBody.dateOfBirth = new Date(filteredBody.dateOfBirth);
//     }
//     if (filteredBody.affiliation?.joiningDate) {
//       filteredBody.affiliation.joiningDate = new Date(filteredBody.affiliation.joiningDate);
//     }
    
//     // Handle profile image separately if needed
//     if (req.file) {
//       filteredBody.profileImage = req.file.path;
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       filteredBody,
//       { 
//         new: true,
//         runValidators: true
//       }
//     ).select('-password -passwordResetToken -passwordResetExpires -passwordResetOTP -otpExpires');

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user: updatedUser
//       }
//     });
//   } catch (err) {
//     console.error('Error updating user:', err);
//     res.status(400).json({
//       status: 'fail',
//       message: err.message || 'Failed to update profile'
//     });
//   }
// };
// // exports.updateMe = async (req, res) => {
// //   try {
// //     // Filter out unwanted fields that shouldn't be updated
// //     const filteredBody = { ...req.body };
// //     delete filteredBody.password;
// //     delete filteredBody.role;
// //     delete filteredBody.isApproved;

// //     const updatedUser = await User.findByIdAndUpdate(
// //       req.user.id,
// //       filteredBody,
// //       { new: true, runValidators: true }
// //     ).select('-password -passwordResetToken -passwordResetExpires');

// //     res.status(200).json({
// //       status: 'success',
// //       data: { user: updatedUser }
// //     });
// //   } catch (err) {
// //     res.status(400).json({
// //       status: 'fail',
// //       message: err.message
// //     });
// //   }
// // };
