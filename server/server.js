// server.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./db/dbConnect');
const authRouter = require('./router/auth-router');
const pubRouter = require('./router/pub-router');

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// --------------------
// App initialization
// --------------------
const app = express();

// --------------------
// Database connection
// (must be idempotent inside connectDB)
// --------------------
connectDB();

// --------------------
// Middleware
// --------------------
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --------------------
// CORS configuration
// --------------------
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://utkarshgupta.info',
      'https://utkarshgupta.vercel.app',
      'https://utkarshgupta-sr931662s-projects.vercel.app',
    ],
    methods: 'GET,POST,PUT,DELETE,PATCH,HEAD',
    credentials: true,
  })
);

// --------------------
// Static uploads (optional)
// --------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------
// Health / root check
// --------------------
app.get('/', (req, res) => {
  res.status(200).send('Academic Portfolio API is running');
});

// --------------------
// API routes
// --------------------
app.use('/api/auth', authRouter);
app.use('/api/publications', pubRouter);

// --------------------
// AWS SES client (single instance)
// --------------------
const ses = new SESClient({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// --------------------
// Contact form endpoint
// --------------------
app.post('/api/contact/send-contact-email', async (req, res) => {
  try {
    const { name, email, phone, organization, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, email, subject, and message are required',
      });
    }

    const textBody = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Organization: ${organization || 'Not provided'}
Subject: ${subject}

Message:
${message}
`;

    const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
  <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <hr />
  <p>${message.replace(/\n/g, '<br/>')}</p>
</div>
`;

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [
          process.env.CONTACT_RECIPIENT_EMAIL || 'sr931662@gmail.com',
        ],
      },
      Message: {
        Subject: {
          Data: `Contact Form: ${subject}`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: { Data: textBody, Charset: 'UTF-8' },
          Html: { Data: htmlBody, Charset: 'UTF-8' },
        },
      },
      Source: process.env.EMAIL_FROM || 'admin@mavicode.in',
      ReplyToAddresses: [email],
    });

    await ses.send(command);

    res.status(200).json({
      status: 'success',
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('SES Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send email',
    });
  }
});

// --------------------
// 404 handler
// --------------------
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Endpoint not found',
  });
});

// --------------------
// Global error handler
// --------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// --------------------
// Cloud Run–compatible server start
// --------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
