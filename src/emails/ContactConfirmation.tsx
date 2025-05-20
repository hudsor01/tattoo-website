interface ContactConfirmationEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

export const ContactConfirmation = ({
  firstName,
  lastName,
  email,
  phone,
  message,
}: ContactConfirmationEmailProps) => {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://fernandogoveatatoo.com';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New contact form submission from ${firstName} ${lastName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
        <div style="max-width: 580px; margin: 0 auto; padding: 20px 0 48px;">
          <img src="${baseUrl}/logo.png" width="170" height="50" alt="Fernando Govea Tattoo" style="display: block; margin: 0 auto 24px;">
          
          <h1 style="font-size: 24px; line-height: 36px; font-weight: bold; text-align: center; margin: 30px 0;">
            New Contact Form Submission
          </h1>
          
          <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0; font-size: 16px; line-height: 24px;">
              <strong>Name:</strong> ${firstName} ${lastName}
            </p>
            <p style="margin: 8px 0; font-size: 16px; line-height: 24px;">
              <strong>Email:</strong> ${email}
            </p>
            ${phone ? `
              <p style="margin: 8px 0; font-size: 16px; line-height: 24px;">
                <strong>Phone:</strong> ${phone}
              </p>
            ` : ''}
          </div>
          
          <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 0;">
          
          <h2 style="font-size: 18px; font-weight: bold; margin: 16px 0;">
            Message:
          </h2>
          
          <p style="font-size: 16px; line-height: 24px; color: #525f7f; margin: 16px 0;">
            ${message}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 0;">
          
          <p style="font-size: 14px; line-height: 21px; color: #8898aa; text-align: center; margin: 30px 0;">
            This email was sent from the contact form at 
            <a href="${baseUrl}" style="color: #556cd6; text-decoration: none;">
              fernandogoveatatoo.com
            </a>
          </p>
        </div>
      </body>
    </html>
  `;
};

export default ContactConfirmation;