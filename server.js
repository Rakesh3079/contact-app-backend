const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/send-email', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Message from ${firstName} ${lastName}`,
    text: `
    You have received a new message from your website:

    Name: ${firstName} ${lastName}
    Email: ${email}

    Message:
    ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});
