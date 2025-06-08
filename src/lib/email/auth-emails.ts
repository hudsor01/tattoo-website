/**
 * Better Auth Email Functions
 * 
 * Email functions specifically for Better Auth integration
 * Handles verification emails and password reset emails
 */

import { sendEmail } from './email-service';

/**
 * Send email verification email for Better Auth
 */
export async function sendVerificationEmail(
  email: string, 
  token: string, 
  baseUrl: string
) {
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  
  const subject = 'Verify your email address - Ink 37 Tattoos';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #000;
          color: #fff;
          padding: 20px;
          text-align: center;
        }
        .logo {
          font-family: 'Arial Black', sans-serif;
          font-size: 24px;
          font-weight: bold;
          color: #e53e3e;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: inline-block;
          background-color: #e53e3e;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">INK 37</div>
      </div>
      <div class="content">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for creating an account with Ink 37 Tattoos!</p>
        <p>To complete your registration and access your account, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p>This verification link will expire in 1 hour for security reasons.</p>
        
        <p>If you didn't create an account with us, please ignore this email.</p>
        
        <p>Best regards,<br>The Ink 37 Team</p>
      </div>
      <div class="footer">
        <p>Ink 37 Tattoos | Dallas/Fort Worth, TX</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Verify Your Email Address - Ink 37 Tattoos

Thank you for creating an account with Ink 37 Tattoos!

To complete your registration and access your account, please verify your email address by visiting this link:

${verificationUrl}

This verification link will expire in 1 hour for security reasons.

If you didn't create an account with us, please ignore this email.

Best regards,
The Ink 37 Team

Ink 37 Tattoos | Dallas/Fort Worth, TX
This is an automated email. Please do not reply to this message.
  `.trim();

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send password reset email for Better Auth
 */
export async function sendPasswordResetEmail(
  email: string, 
  token: string, 
  baseUrl: string
) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const subject = 'Reset your password - Ink 37 Tattoos';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #000;
          color: #fff;
          padding: 20px;
          text-align: center;
        }
        .logo {
          font-family: 'Arial Black', sans-serif;
          font-size: 24px;
          font-weight: bold;
          color: #e53e3e;
        }
        .content {
          padding: 20px;
        }
        .button {
          display: inline-block;
          background-color: #e53e3e;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">INK 37</div>
      </div>
      <div class="content">
        <h2>Reset Your Password</h2>
        <p>You recently requested to reset your password for your Ink 37 Tattoos account.</p>
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <div class="warning">
          <strong>Security Notice:</strong>
          <ul>
            <li>This password reset link will expire in 1 hour</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Your password will not be changed until you click the link above</li>
          </ul>
        </div>
        
        <p>If you continue to have trouble accessing your account, please contact us.</p>
        
        <p>Best regards,<br>The Ink 37 Team</p>
      </div>
      <div class="footer">
        <p>Ink 37 Tattoos | Dallas/Fort Worth, TX</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Reset Your Password - Ink 37 Tattoos

You recently requested to reset your password for your Ink 37 Tattoos account.

Click this link to reset your password:
${resetUrl}

Security Notice:
- This password reset link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will not be changed until you click the link above

If you continue to have trouble accessing your account, please contact us.

Best regards,
The Ink 37 Team

Ink 37 Tattoos | Dallas/Fort Worth, TX
This is an automated email. Please do not reply to this message.
  `.trim();

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
