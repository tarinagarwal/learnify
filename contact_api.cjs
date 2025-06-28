require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5500;


app.use(cors());
app.use(express.json());

// Configure your transporter (copied from nodemailer_api.cjs)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.test_dev_mail_id,     //SMTP email address
    pass: process.env.test_dev_mail_password,   //app password
  },
});

// API endpoint to handle contact form submissions
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, inquiryType, message } = req.body;
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const mailOptions = {
    from: process.env.test_dev_mail_id,
    to: process.env.devs_mail_id, // Developer's email
    subject: `Contact Form: ${inquiryType || 'General'} from ${firstName} ${lastName}`,
    text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nInquiry Type: ${inquiryType}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Contact API server running on port ${PORT}`);
});
