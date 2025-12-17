const jwt = require('jsonwebtoken');
const User = require('../db/userSchema');
const AppError = require('../utils/appError');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Get token from headers or cookies
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.' 
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // 3) Convert string ID to MongoDB ObjectId before querying
    const userId = new mongoose.Types.ObjectId(decoded.id); // 🚀 Fix here
    const currentUser = await User.findById(userId); // Now correctly searches by ObjectId
    console.log('Found user:', currentUser);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.'
      });
    }

    // 5) Check if account is approved
    if (!currentUser.isApproved) {
      return res.status(403).json({
        status: 'fail',
        message: 'Your account is not yet approved. Please contact administrator.'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ 
      status: 'fail',
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Middleware to check if user is active
exports.checkActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    next();
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong checking user activity'
    });
  }
};
















































// const jwt = require('jsonwebtoken')
// const User = require('../db/userSchema.js')
// const AppError = require('../utils/appError.js')


// // Add these to your existing auth-controller.js exports
// exports.protect = async (req, res, next) => {
//   try {
//     let token;
    
//     // 1) Check for token in headers
//     if (req.headers.authorization?.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }
//     // 2) Check for token in cookies (if you're using cookies)
//     else if (req.cookies?.jwt) {
//       token = req.cookies.jwt;
//     }

//     if (!token) {
//       return res.status(401).json({ message: 'Not authenticated' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };
// // exports.protect = async (req, res, next) => {
// //   try {
// //     let token;
// //     if (req.headers.authorization?.startsWith('Bearer')) {
// //       token = req.headers.authorization.split(' ')[1];
// //     }

// //     if (!token) {
// //       return res.status(401).json({ message: 'Not authenticated' });
// //     }

// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     req.user = await User.findById(decoded.id);
// //     next();
// //   } catch (err) {
// //     res.status(401).json({ message: 'Invalid token' });
// //   }
// // };

// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         status: 'fail',
//         message: 'You do not have permission to perform this action'
//       });
//     }
//     next();
//   };
// };

// // Protect routes - user must be logged in
// // export const protect = async (req, res, next) => {
// //   try {
// //     // 1) Getting token and check if it's there
// //     let token;
// //     if (
// //       req.headers.authorization &&
// //       req.headers.authorization.startsWith('Bearer')
// //     ) {
// //       token = req.headers.authorization.split(' ')[1];
// //     } else if (req.cookies.jwt) {
// //       token = req.cookies.jwt;
// //     }

// //     if (!token) {
// //       return next(
// //         new AppError('You are not logged in! Please log in to get access.', 401)
// //       );
// //     }

// //     // 2) Verification token
// //     const decoded = await jwt.verify(token, process.env.JWT_SECRET);

// //     // 3) Check if user still exists
// //     const currentUser = await User.findById(decoded.id);
// //     if (!currentUser) {
// //       return next(
// //         new AppError('The user belonging to this token no longer exists.', 401)
// //       );
// //     }

// //     // 4) Check if user changed password after the token was issued
// //     if (currentUser.changedPasswordAfter(decoded.iat)) {
// //       return next(
// //         new AppError('User recently changed password! Please log in again.', 401)
// //       );
// //     }

// //     // GRANT ACCESS TO PROTECTED ROUTE
// //     req.user = currentUser;
// //     res.locals.user = currentUser;
// //     next();
// //   } catch (err) {
// //     next(err);
// //   }
// // };