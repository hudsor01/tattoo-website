import * as React from 'react';

interface AuthConfirmationProps {
  confirmationUrl: string;
  userEmail: string;
  siteUrl: string;
  siteName: string;
}

const AuthConfirmation: React.FC<AuthConfirmationProps> & { name: string } = ({
  confirmationUrl,
  // userEmail parameter is unused but required by interface
  siteUrl,
  siteName,
}) => {
  // Email templates need head and img elements
  return (
    <html>
      <head>
        <title>Confirm your email</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={main}>
        <div style={{
          display: 'none',
          overflow: 'hidden',
          lineHeight: '1px',
          opacity: 0,
          maxHeight: 0,
          maxWidth: 0,
        }}>
          Confirm your email to get started with {siteName}!
          &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
        </div>

        <div style={container}>
          <img
            src={`${siteUrl}/logo.png`}
            width="120"
            height="50"
            alt={siteName}
            style={logo}
          />

          <h1 style={h1}>Confirm your email</h1>

          <p style={paragraph}>Hello,</p>

          <p style={paragraph}>
            Thank you for signing up for {siteName}! Please confirm your email address 
            by clicking the button below.
          </p>

          <div style={buttonContainer}>
            <a
              style={button}
              href={confirmationUrl}
            >
              Confirm Email Address
            </a>
          </div>

          <p style={paragraph}>
            Or copy and paste this link into your browser:
          </p>
          
          <p style={linkText}>
            {confirmationUrl}
          </p>

          <hr style={hr} />

          <div style={footer}>
            <p style={footerText}>
              If you didn&apos;t create an account with {siteName}, you can safely ignore this email.
            </p>

            <p style={footerText}>
              &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Helvetica, Arial, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const logo = {
  margin: '0 auto 30px',
  display: 'block',
};

const h1 = {
  color: '#333333',
  fontSize: '26px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const paragraph = {
  color: '#4f4f4f',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0 auto',
};

const linkText = {
  color: '#3b82f6',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#eaeaea',
  margin: '30px 0 20px',
};

const footer = {
  margin: '20px 0',
};

const footerText = {
  color: '#6f6f6f',
  fontSize: '14px',
  margin: '8px 0',
  textAlign: 'center' as const,
};

// Add the template name for tracking
AuthConfirmation.name = 'auth_confirmation';

export default AuthConfirmation;