/**
 * Aftercare Reminder Email Template
 * 
 * This email template provides aftercare instructions and reminders for tattoo clients
 */

export interface AftercareReminderEmailData {
  customerName: string;
  appointmentDate: string;
  artistName: string;
}

export function generateAftercareReminderEmail(data: AftercareReminderEmailData) {
  const { customerName, appointmentDate, artistName } = data;
  
  const subject = "Tattoo Aftercare Reminder - Ink 37 Tattoos";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tattoo Aftercare Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>We hope you're enjoying your new tattoo! Here are important aftercare instructions to ensure proper healing:</p>
            
            <ul>
              <li>Keep the tattoo clean and dry</li>
              <li>Apply a thin layer of unscented moisturizer 2-3 times daily</li>
              <li>Avoid direct sunlight and swimming for 2 weeks</li>
              <li>Do not pick or scratch at scabs</li>
              <li>Wear loose, clean clothing over the tattoo</li>
            </ul>
            
            <p>Your tattoo was done on ${appointmentDate} by ${artistName}.</p>
            
            <p>If you have any concerns or questions about the healing process, please don't hesitate to contact us.</p>
            
            <p>Thank you for choosing Ink 37 Tattoos!</p>
          </div>
          <div class="footer">
            <p>Ink 37 Tattoos | Your trusted tattoo studio</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return { subject, html };
}