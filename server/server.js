// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbConnect');
const authRouter = require('./router/auth-router');
const pubRouter = require('./router/pub-router');
const path = require('path');
const morgan = require('morgan');

// Initialize app
const app = express();

// Database connection
connectDB();

// Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://utkarshgupta.info', 'https://utkarshgupta.vercel.app', 'https://utkarshgupta-sr931662s-projects.vercel.app'],
    methods: 'GET,POST,PUT,DELETE,PATCH,HEAD',
    credentials: true,
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get('/', (req, res) => {
  res.status(200).send('Academic Portfolio API');
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/publications', pubRouter);

// Add contact route directly (temporary solution)
app.post('/api/contact/send-contact-email', async (req, res) => {
  const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
  
  // Configure SES with proper credentials
  const ses = new SESClient({
    region: process.env.AWS_SES_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const { name, email, phone, organization, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      error: "Name, email, subject, and message are required" 
    });
  }

  // Email template with better formatting
  const emailContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Organization: ${organization || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
This message was sent from your website contact form.
  `;

  const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2fdce8;">New Contact Form Submission</h2>
  
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
    <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
    <p><strong>Subject:</strong> ${subject}</p>
  </div>

  <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #2fdce8;">Message:</h3>
    <p style="white-space: pre-wrap;">${message}</p>
  </div>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="color: #666; font-size: 12px;">
    This message was sent from your website contact form on ${new Date().toLocaleString()}
  </p>
</div>
  `;

  const params = {
    Destination: {
      ToAddresses: [process.env.CONTACT_RECIPIENT_EMAIL || "sr931662@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: emailContent,
        },
        Html: {
          Charset: "UTF-8",
          Data: htmlContent,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Contact Form: ${subject}`,
      },
    },
    Source: process.env.EMAIL_FROM || "admin@mavicode.in",
    ReplyToAddresses: [email],
  };

  try {
    const command = new SendEmailCommand(params);
    await ses.send(command);
    
    res.json({ 
      status: "success", 
      message: "Message sent successfully!" 
    });
  } catch (err) {
    console.error("SES Error:", err);
    
    // More detailed error response
    res.status(500).json({ 
      status: "error", 
      message: "Error sending email", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Endpoint not found'
  });
});

// Serve frontend (React build)
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
