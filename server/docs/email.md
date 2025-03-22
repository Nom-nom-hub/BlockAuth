# Email Service Utility

## Overview
The email service utility provides a simple interface for sending emails from the application using Nodemailer. It handles connection management, email sending, and proper cleanup.

## Configuration
The email service requires the following environment variables:

- `EMAIL_HOST`: SMTP server hostname
- `EMAIL_PORT`: SMTP server port
- `EMAIL_SECURE`: Set to 'true' for SSL/TLS connections
- `EMAIL_USER`: SMTP authentication username
- `EMAIL_PASSWORD`: SMTP authentication password
- `EMAIL_FROM_NAME`: Sender name for outgoing emails
- `EMAIL_FROM_ADDRESS`: Sender email address for outgoing emails

## Usage

### Sending Emails

```javascript
const { sendEmail } = require('../utils/email');

// Send a plain text email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our platform',
  text: 'Thank you for registering with our service.'
});

// Send an email with HTML content
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our platform',
  text: 'Thank you for registering with our service.',
  html: '<h1>Welcome!</h1><p>Thank you for registering with our service.</p>'
});
```

### Cleanup

When shutting down the application, make sure to close email connections:

```javascript
const { closeConnections } = require('../utils/email');

// In your shutdown handler
await closeConnections();
```

## API Reference

### sendEmail(options)

Sends an email using the configured transport.

**Parameters:**
- `options` (Object): Email options
  - `to` (String): Recipient email address
  - `subject` (String): Email subject
  - `text` (String): Plain text content
  - `html` (String, optional): HTML content

**Returns:**
- Promise that resolves with the Nodemailer send result

### closeConnections()

Closes all open email transport connections.

**Returns:**
- Promise that resolves when connections are closed