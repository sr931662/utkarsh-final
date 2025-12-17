// // const nodemailer = require('nodemailer');
// // const crypto = require('crypto');

// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS
// //   }
  
// // });

// // const generateOTP = () => {
// //   return {
// //     code: crypto.randomInt(100000, 999999).toString(),
// //     expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
// //   };
// // };


// // const sendOTP = async (email, otp) => {
// //   try {
// //     console.log('[Email] Preparing to send OTP to:', email);
// //     console.log('Environment variables:', {
// //       EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'missing',
// //       EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'missing',
// //       JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'missing'
// //     });
// //     const mailOptions = {
// //       from: process.env.EMAIL_USER,
// //       to: email,
// //       subject: 'Your Admin Verification OTP',
// //       html: `
// //         <div>
// //           <h2>Admin Verification</h2>
// //           <p>Your OTP code is: <strong>${otp}</strong></p>
// //           <p>This code will expire in 10 minutes.</p>
// //         </div>
// //       `
// //     };

// //     console.log('[Email] Mail options prepared:', {
// //       from: mailOptions.from,
// //       to: mailOptions.to,
// //       subject: mailOptions.subject
// //     });

// //     const info = await transporter.sendMail(mailOptions);
// //     console.log('[Email] Message sent:', info.messageId);
// //     return true;
// //   } catch (error) {
// //     console.error('[Email] Error sending OTP:', error);
// //     console.error('Full error details:', {
// //       message: error.message,
// //       stack: error.stack,
// //       response: error.response
// //     });
// //     return false;
// //   }
// // };

// // module.exports = { generateOTP, sendOTP };

// // otpController.js


// const emailjs = require('emailjs-com');
// const crypto = require('crypto');

// const generateOTP = () => {
//   return {
//     code: crypto.randomInt(100000, 999999).toString(),
//     expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
//   };
// };

// const sendOTP = async (email, otp) => {
//   try {
//     const response = await emailjs.send(
//       process.env.EMAILJS_SERVICE_ID,
//       process.env.EMAILJS_TEMPLATE_ID,
//       {
//         to_email: email,
//         otp: otp.code,
//         expiration: "10 minutes"
//       },
//       process.env.EMAILJS_USER_ID
//     );

//     console.log('EmailJS response:', response);
//     return true;
//   } catch (error) {
//     console.error('EmailJS error:', error);
//     throw new Error('Failed to send OTP email');
//   }
// };

// module.exports = { generateOTP, sendOTP };

// utils/otpGenerate.js
const generateOTP = () => {
  return {
    code: Math.floor(100000 + Math.random() * 900000).toString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
};

module.exports = { generateOTP };
