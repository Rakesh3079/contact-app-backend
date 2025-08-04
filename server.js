const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection using env variable
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Define a schema and model
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  submittedAt: { type: Date, default: Date.now }
});

// Use existing collection name 'Submissions' in UserDetails DB
const Form = mongoose.model('Submissions', formSchema, 'Submissions');

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Email and DB route
app.post('/send-email', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    console.log('📩 Received form data:', req.body);

    // Save to MongoDB
    const newSubmission = new FormSubmission({ firstName, lastName, email, message });
    await newSubmission.save();
    console.log('✅ Data saved to MongoDB');

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'New Contact Form Submission',
      html: `
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.response);

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('❌ Error in /send-email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Try again.' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
