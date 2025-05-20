interface AppointmentConfirmationProps {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  artistName: string;
  appointmentType: string;
  studioName: string;
  studioAddress: string;
  studioPhone: string;
  depositAmount: number;
  appointmentId: string;
}

export function generateAppointmentConfirmationEmail({
  customerName,
  appointmentDate,
  appointmentTime,
  artistName,
  appointmentType,
  studioName,
  studioAddress,
  studioPhone,
  depositAmount,
  appointmentId,
}: AppointmentConfirmationProps): { subject: string; html: string } {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const websiteUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';

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
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .appointment-details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .detail-row {
            margin: 10px 0;
            font-size: 16px;
          }
          .deposit-section {
            border-top: 1px solid #eaeaea;
            border-bottom: 1px solid #eaeaea;
            margin: 30px 0;
            padding: 30px 0;
            text-align: center;
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
          .preparation-list {
            margin: 20px 0;
            padding-left: 20px;
          }
          .preparation-list li {
            margin: 10px 0;
            line-height: 1.5;
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
            <h1>Appointment Confirmation</h1>
          </div>
          
          <div class="content">
            <p>Hello ${customerName},</p>
            
            <p>Your tattoo appointment has been confirmed! We're looking forward to seeing you.</p>
            
            <div class="appointment-details">
              <h2>Appointment Details</h2>
              <div class="detail-row"><strong>Date:</strong> ${formattedDate}</div>
              <div class="detail-row"><strong>Time:</strong> ${appointmentTime}</div>
              <div class="detail-row"><strong>Artist:</strong> ${artistName}</div>
              <div class="detail-row"><strong>Type:</strong> ${appointmentType}</div>
              <div class="detail-row"><strong>Location:</strong> ${studioAddress}</div>
              <div class="detail-row"><strong>Appointment ID:</strong> ${appointmentId}</div>
            </div>
            
            ${depositAmount > 0 ? `
              <div class="deposit-section">
                <h2>Deposit Information</h2>
                <p>To secure your appointment, a deposit of $${depositAmount.toFixed(2)} is required.</p>
                <a href="${websiteUrl}/payment/${appointmentId}" class="button">Pay Deposit Now</a>
                <p style="font-size: 14px; color: #666; font-style: italic;">
                  Deposit must be paid within 48 hours to keep your booking.
                </p>
              </div>
            ` : ''}
            
            <div>
              <h2>Preparation for Your Appointment</h2>
              <p>To ensure the best experience for your tattoo session, please:</p>
              <ul class="preparation-list">
                <li>Get a good night's sleep before your appointment</li>
                <li>Eat a meal before arriving</li>
                <li>Stay hydrated</li>
                <li>Wear comfortable clothing that allows easy access to the tattoo area</li>
                <li>Consider bringing headphones and something to keep you occupied</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>If you need to reschedule or have any questions, please contact us at ${studioPhone} at least 48 hours before your appointment.</p>
            <p>&copy; ${new Date().getFullYear()} ${studioName}. All rights reserved.</p>
            <p>
              <a href="${websiteUrl}">Website</a> •
              <a href="${websiteUrl}/faq">FAQ</a> •
              <a href="${websiteUrl}/policies">Policies</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `Appointment Confirmation - ${studioName}`,
    html,
  };
}

export default generateAppointmentConfirmationEmail;