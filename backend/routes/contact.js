import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure email transporter with better Gmail settings
const createTransporter = () => {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  };

// Test email configuration endpoint
router.get('/test-email', async (req, res) => {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
    
    const transporter = createTransporter();
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'Email configuration is working!'
    });
  } catch (error) {
    console.error('Email configuration test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration failed',
      error: error.message
    });
  }
});

// POST route to send contact form email
router.post('/send-email', async (req, res) => {
  try {
    console.log('Contact form submission received');
    console.log('Request body:', req.body);
    
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed - invalid email format');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Test the connection first
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        message: 'Email service configuration error',
        error: process.env.NODE_ENV === 'development' ? verifyError.message : 'Email service unavailable'
      });
    }

    // Email content to send to auto.infovision@gmail.com
    const mailOptions = {
      from: `"AutoVision Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'auto.infovision@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">New Contact Form Submission</h2>
            <p style="color: #666; margin-bottom: 0;">You have received a new message through the AutoVision contact form.</p>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0;">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Contact Details</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Name:</strong>
              <span style="color: #333; margin-left: 10px;">${name}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Email:</strong>
              <span style="color: #333; margin-left: 10px;">${email}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Phone:</strong>
              <span style="color: #333; margin-left: 10px;">${phone}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #555;">Subject:</strong>
              <span style="color: #333; margin-left: 10px;">${subject}</span>
            </div>
            
            <div style="margin-bottom: 0;">
              <strong style="color: #555;">Message:</strong>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #007bff;">
                <p style="margin: 0; line-height: 1.6; color: #333;">${message}</p>
              </div>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 20px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              This message was sent from the AutoVision website contact form.
              <br>
              Please respond directly to the customer's email: <a href="mailto:${email}" style="color: #007bff;">${email}</a>
            </p>
          </div>
        </div>
      `,
      replyTo: email 
    };

    // Send email to AutoVision
    console.log('Sending email to AutoVision...');
    const result1 = await transporter.sendMail(mailOptions);
    console.log('Email sent to AutoVision successfully:', result1.messageId);

    // Customer confirmation email
    const customerConfirmation = {
      from: `"AutoVision" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting AutoVision',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h2 style="margin: 0;">Thank You for Contacting AutoVision</h2>
          </div>
          
          <div style="background-color: white; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #333; line-height: 1.6;">Dear ${name},</p>
            
            <p style="color: #333; line-height: 1.6;">
              Thank you for reaching out to us! We have received your message and our team will get back to you within 24 hours.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
              <p style="margin: 0; color: #555; font-size: 14px;"><strong>Your message:</strong></p>
              <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">${message}</p>
            </div>
            
            <p style="color: #333; line-height: 1.6;">
              If you have any urgent questions, feel free to call us directly at +1 (977) 9860340616.
            </p>
            
            <p style="color: #333; line-height: 1.6;">
              Best regards,<br>
              <strong>The AutoVision Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 10px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Follow us on social media for the latest updates and car deals!
            </p>
          </div>
        </div>
      `
    };

    // Send confirmation email to customer
    console.log('Sending confirmation email to customer...');
    const result2 = await transporter.sendMail(customerConfirmation);
    console.log('Confirmation email sent to customer successfully:', result2.messageId);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Detailed email sending error:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error messages
    let errorMessage = 'Failed to send email. Please try again later.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check email configuration.';
    } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      errorMessage = 'Connection to email server failed.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Email authentication failed. Invalid credentials.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email service timeout. Please try again.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      // Only include error details in development
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        code: error.code
      })
    });
  }
});

export default router;