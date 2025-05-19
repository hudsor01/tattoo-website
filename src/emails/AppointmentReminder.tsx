interface AppointmentReminderProps {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  artistName: string;
  appointmentType: string;
  studioName: string;
  studioAddress: string;
  studioPhone: string;
  appointmentId: string;
  preparationTips: string[];
}

export function generateAppointmentReminderEmail({
  customerName,
  appointmentDate,
  appointmentTime,
  artistName,
  appointmentType,
  studioName,
  studioAddress,
  studioPhone,
  appointmentId,
  preparationTips,
}: AppointmentReminderProps): { subject: string; html: string } {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate days remaining
  const today = new Date();
  const aptDate = new Date(appointmentDate);
  const daysRemaining = Math.ceil((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const websiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
          .preparation-section {
            margin: 30px 0;
          }
          .preparation-list {
            margin: 20px 0;
            padding-left: 20px;
          }
          .preparation-list li {
            margin: 10px 0;
            line-height: 1.5;
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
            <h1>Appointment Reminder</h1>
          </div>
          
          <div class="content">
            <p>Hello ${customerName},</p>
            
            <p>
              This is a friendly reminder that your tattoo appointment is
              ${daysRemaining <= 1 ? 'tomorrow' : `in ${daysRemaining} days`}. We're looking
              forward to seeing you!
            </p>
            
            <div class="appointment-details">
              <h2>Appointment Details</h2>
              <div class="detail-row"><strong>Date:</strong> ${formattedDate}</div>
              <div class="detail-row"><strong>Time:</strong> ${appointmentTime}</div>
              <div class="detail-row"><strong>Artist:</strong> ${artistName}</div>
              <div class="detail-row"><strong>Type:</strong> ${appointmentType}</div>
              <div class="detail-row"><strong>Location:</strong> ${studioAddress}</div>
              <div class="detail-row"><strong>Appointment ID:</strong> ${appointmentId}</div>
            </div>
            
            <div class="preparation-section">
              <h2>Preparation Tips</h2>
              <p>To ensure the best experience for your tattoo session, please:</p>
              <ul class="preparation-list">
                ${preparationTips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
            
            <div class="action-section">
              <a href="${websiteUrl}/appointments/${appointmentId}" class="button">
                View Appointment Details
              </a>
              <p style="font-size: 14px; color: #666; font-style: italic;">
                Need to reschedule? Please contact us at least 48 hours in advance.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact us at ${studioPhone}.</p>
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
    subject: `Reminder: Your tattoo appointment is ${daysRemaining <= 1 ? 'tomorrow' : `in ${daysRemaining} days`}`,
    html,
  };
}

export default generateAppointmentReminderEmail;