interface DepositReminderProps {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: string;
  studioName: string;
  depositAmount: number;
  paymentLink: string;
  dueDate: Date;
}

export function generateDepositReminderEmail({
  customerName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  studioName,
  depositAmount,
  paymentLink,
  dueDate,
}: DepositReminderProps): { subject: string; html: string } {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
          .deposit-section {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
            border: 1px solid #eaeaea;
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
          .policy-section {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .policy-text {
            font-size: 14px;
            color: #4f4f4f;
            line-height: 1.5;
            margin: 10px 0;
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
            <h1>Deposit Reminder</h1>
          </div>
          
          <div class="content">
            <p>Hello ${customerName},</p>
            
            <p>This is a friendly reminder that your deposit for the upcoming tattoo appointment has not been received yet. To secure your appointment, please make your deposit payment as soon as possible.</p>
            
            <div class="deposit-section">
              <h2>Deposit Details</h2>
              <div class="detail-row"><strong>Amount Due:</strong> $${depositAmount.toFixed(2)}</div>
              <div class="detail-row"><strong>Due By:</strong> ${formattedDueDate}</div>
              <a href="${paymentLink}" class="button">Make Payment Now</a>
            </div>
            
            <div class="appointment-details">
              <h2>Appointment Information</h2>
              <div class="detail-row"><strong>Date:</strong> ${formattedDate}</div>
              <div class="detail-row"><strong>Time:</strong> ${appointmentTime}</div>
              <div class="detail-row"><strong>Type:</strong> ${appointmentType}</div>
            </div>
            
            <div class="policy-section">
              <h3>Deposit Policy</h3>
              <p class="policy-text">
                Deposits are required to secure your appointment time with your artist. If the deposit
                is not received by the due date, your appointment may be cancelled and the time slot
                offered to another client.
              </p>
              <p class="policy-text">
                Deposits are non-refundable but will be applied to the total cost of your tattoo.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>If you've already made your payment, please disregard this message. If you have any questions or need assistance with your payment, please reply to this email.</p>
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
    subject: `Deposit Reminder - ${studioName}`,
    html,
  };
}

export default generateDepositReminderEmail;