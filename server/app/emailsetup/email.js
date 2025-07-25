const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,                
  secure: false,            
  auth: {
    user: 'rishi2020.rp@gmail.com',
    pass: 'ewcr eidf dovg fncb'
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendOTP(email, otp) {
  try {
    const info = await transporter.sendMail({
      from: '"OTP Service" <rishi2020.rp@gmail.com>',
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP code is: ${otp}`
    });

    console.log('OTP email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
  }
}

module.exports = { sendOTP };
