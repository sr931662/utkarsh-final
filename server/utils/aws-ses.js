const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const AppError = require('./appError');

// Initialize SES client with AWS SDK v3
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

/**
 * Send OTP email for password reset
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  
  if (!fromEmail) {
    throw new AppError('AWS SES sender email not configured', 500);
  }

  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset OTP</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
                  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                  .header { text-align: center; margin-bottom: 30px; }
                  .otp-code { font-size: 32px; font-weight: bold; color: #2d3748; letter-spacing: 5px; text-align: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>Password Reset Request</h1>
                      <p>Use the OTP below to reset your password:</p>
                  </div>
                  <div class="otp-code">${otp}</div>
                  <p style="color: #e53e3e; font-size: 14px; text-align: center;">This OTP will expire in 10 minutes.</p>
                  <p>If you didn't request this password reset, please ignore this email.</p>
                  <div class="footer">
                      &copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Your App'}. All rights reserved.
                  </div>
              </div>
          </body>
          </html>
          `
        },
        Text: {
          Charset: 'UTF-8',
          Data: `Your OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request a password reset, please ignore this email.`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Your Password Reset OTP'
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log("✅ OTP email sent. MessageId:", response.MessageId);
    return true;
  } catch (error) {
    console.error("❌ AWS SES Error Details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific AWS errors
    if (error.name === 'MessageRejected') {
      throw new AppError('Email rejected. Please verify sender email in AWS SES.', 400);
    }
    if (error.name === 'AccessDeniedException') {
      throw new AppError('AWS access denied. Check IAM permissions.', 403);
    }
    
    throw new AppError('Failed to send OTP email. Please try again later.', 500);
  }
};

/**
 * Send contact form email
 */
exports.sendContactEmail = async ({ name, email, phone, organization, subject, message }) => {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  const toEmail = process.env.CONTACT_EMAIL || fromEmail;

  const params = {
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>📧 New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-line; background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
            </div>
          `
        },
        Text: {
          Charset: 'UTF-8',
          Data: `
            New Contact Form Submission:
            Name: ${name}
            Email: ${email}
            Phone: ${phone || 'Not provided'}
            Organization: ${organization || 'Not provided'}
            Subject: ${subject || 'No Subject'}
            Message: ${message}
          `
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `New Contact: ${subject || 'No Subject'}`
      }
    },
    Source: fromEmail,
    ReplyToAddresses: [email]
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log("✅ Contact email sent successfully");
    return true;
  } catch (error) {
    console.error('❌ Contact email error:', error);
    throw new AppError('Failed to send contact email', 500);
  }
};