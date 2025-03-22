const nodemailer = require('nodemailer');

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

let isConnected = false;

// Verify connection configuration
(async function() {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await transporter.verify();
      isConnected = true;
      console.log('Email service connected successfully');
    } catch (error) {
      console.error('Email service connection error:', error);
    }
  }
})();

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text content
 * @param {String} [options.html] - HTML content
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    text: options.text
  };
  
  if (options.html) {
    mailOptions.html = options.html;
  }
  
  return transporter.sendMail(mailOptions);
};

/**
 * Close email transport connections
 * @returns {Promise} - Resolves when connections are closed
 */
const closeConnections = async () => {
  if (isConnected) {
    return new Promise((resolve) => {
      transporter.close(() => {
        console.log('Email service connections closed');
        isConnected = false;
        resolve();
      });
    });
  }
  return Promise.resolve();
};

module.exports = { sendEmail, closeConnections };
