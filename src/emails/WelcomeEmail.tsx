interface WelcomeEmailProps {
  firstName: string;
  studioName: string;
  studioWebsite: string;
  instagramHandle: string;
}

export function generateWelcomeEmail({
  firstName,
  studioName,
  studioWebsite,
  instagramHandle,
}: WelcomeEmailProps): { subject: string; html: string } {

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          .header {
            background-color: #9333ea;
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .features {
            margin: 25px 0;
          }
          .feature {
            margin: 12px 0;
            font-size: 16px;
            color: #4f4f4f;
          }
          .action-section {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background-color: #9333ea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .social-section {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 30px 0;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .footer a {
            color: #9333ea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${studioName}!</h1>
          </div>
          
          <div class="content">
            <p>Hello ${firstName},</p>
            
            <p>Thank you for creating an account with us. We're excited to have you join our tattoo community! With your new account, you can:</p>
            
            <div class="features">
              <div class="feature">🗓️ Book appointments online</div>
              <div class="feature">📱 Manage your appointments and consultations</div>
              <div class="feature">💡 Submit tattoo ideas and receive design feedback</div>
              <div class="feature">📸 Access your tattoo photos and aftercare instructions</div>
            </div>
            
            <div class="action-section">
              <a href="${studioWebsite}" class="button">Visit Your Account</a>
            </div>
            
            <div class="social-section">
              <h2>Connect With Us</h2>
              <p>
                Follow us on Instagram 
                <a href="https://instagram.com/${instagramHandle.replace('@', '')}" style="color: #9333ea;">
                  ${instagramHandle}
                </a>
                to see our latest work, flash designs, and studio updates.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>We look forward to creating amazing tattoos with you!</p>
            <p>&copy; ${new Date().getFullYear()} ${studioName}. All rights reserved.</p>
            <p>
              <a href="${studioWebsite}">Website</a> •
              <a href="${studioWebsite}/faq">FAQ</a> •
              <a href="${studioWebsite}/contact">Contact Us</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `Welcome to ${studioName}!`,
    html,
  };
}

export default generateWelcomeEmail;