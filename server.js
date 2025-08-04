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
  const { name, email, phone, message } = req.body;

  try {
    // Save form data to MongoDB
    const formData = new Form({ name, email, phone, message });
    await formData.save();
    console.log('🟢 Form data saved to MongoDB');

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: 'New Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent');

    res.status(200).json({ message: 'Form submitted and email sent successfully!' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
