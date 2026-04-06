/**
 * Email Service Configuration
 * Handles SMTP transporter setup and email dispatching via Nodemailer.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Configure Nodemailer transporter using Gmail.
 * Expects EMAIL_USER and EMAIL_PASS (App Password) in .env
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends an email using the configured transporter.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML content of the email
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"EWAY LMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
