interface CancellationNoticeProps {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: string;
  studioName: string;
  studioPhone: string;
  reason: string;
  depositAmount: number;
  isRefundable: boolean;
}

export function generateCancellationNoticeEmail({
  customerName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  studioName,
  studioPhone,
  reason,
  depositAmount,
  isRefundable,
}: CancellationNoticeProps): { subject: string; html: string } {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
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
            background-color: #dc2626;
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
          .reason-section {
            margin: 20px 0;
            border-left: 4px solid #f0f0f0;
            padding-left: 15px;
          }
          .deposit-section {
            background-color: ${isRefundable ? '#f0f9eb' : '#fafafa'};
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .reschedule-section {
            text-align: center;
            margin: 25px 0;
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
          .small-text {
            color: #6f6f6f;
            font-size: 14px;
            font-style: italic;
            margin: 10px 0;
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
            <h1>Appointment Cancellation</h1>
          </div>
          
          <div class="content">
            <p>Hello ${customerName},</p>
            
            <p>We're writing to inform you that your tattoo appointment has been cancelled.</p>
            
            <div class="appointment-details">
              <h2>Cancelled Appointment Details</h2>
              <div class="detail-row"><strong>Date:</strong> ${formattedDate}</div>
              <div class="detail-row"><strong>Time:</strong> ${appointmentTime}</div>
              <div class="detail-row"><strong>Type:</strong> ${appointmentType}</div>
            </div>
            
            <div class="reason-section">
              <h2>Reason for Cancellation</h2>
              <p>${reason}</p>
            </div>
            
            ${depositAmount > 0 ? `
              <div class="deposit-section">
                <h2>Deposit Information</h2>
                ${isRefundable ? `
                  <p>Your deposit of $${depositAmount.toFixed(2)} will be refunded to your original payment method within 5-7 business days.</p>
                  <p class="small-text">If you don't see the refund after 7 business days, please contact us.</p>
                ` : `
                  <p>As per our cancellation policy, your deposit of $${depositAmount.toFixed(2)} is non-refundable. However, we'd be happy to discuss applying it to a future appointment.</p>
                `}
              </div>
            ` : ''}
            
            <div class="reschedule-section">
              <h2>Would you like to reschedule?</h2>
              <p>We'd love to find another time for your tattoo. You can reschedule using our online booking system or by contacting us directly.</p>
              <a href="${websiteUrl}/booking" class="button">Book a New Appointment</a>
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
    subject: `Appointment Cancellation - ${studioName}`,
    html,
  };
}

export default generateCancellationNoticeEmail;