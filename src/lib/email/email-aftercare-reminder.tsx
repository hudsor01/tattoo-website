'use client';

import React from 'react';
import { AftercareReminderProps } from '@/types';

export function generateAftercareReminderEmail({
  clientName,
  tattooType,
  appointmentDate,
  artistName,
  studioName,
  studioAddress,
  studioPhone,
  studioEmail,
  studioWebsite,
  clientPortalLink,
}: AftercareReminderProps): { subject: string; html: string; text: string } {
  const subject = `Aftercare Instructions for Your Recent Tattoo | ${studioName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tattoo Aftercare Instructions</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eeeeee;
    }
    .logo {
      max-width: 200px;
      height: auto;
    }
    h1 {
      color: #e53935;
      font-size: 24px;
      margin-bottom: 20px;
    }
    h2 {
      color: #e53935;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      margin-bottom: 15px;
    }
    .step {
      margin-bottom: 20px;
      padding-left: 20px;
      border-left: 3px solid #e53935;
    }
    .step h3 {
      color: #e53935;
      margin-top: 0;
      margin-bottom: 10px;
    }
    .warning {
      background-color: #fff4f4;
      border-left: 3px solid #e53935;
      padding: 15px;
      margin: 25px 0;
    }
    .warning h3 {
      color: #e53935;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background-color: #e53935;
      color: white;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${studioName}</h1>
    </div>

    <p>Hello ${clientName},</p>

    <p>Thank you for choosing us for your ${tattooType} tattoo! We hope you're enjoying your new ink. To ensure your tattoo heals properly and maintains its quality, please follow these aftercare instructions carefully.</p>

    <h2>Tattoo Aftercare Instructions</h2>

    <div class="step">
      <h3>Day 1-3: Initial Care</h3>
      <p>
        • Leave the bandage on for 2-4 hours<br>
        • Gently wash with unscented antibacterial soap<br>
        • Apply a thin layer of recommended aftercare ointment<br>
        • Wash 2-3 times daily
      </p>
    </div>

    <div class="step">
      <h3>Day 4-14: Healing Process</h3>
      <p>
        • Continue washing 2-3 times daily<br>
        • Switch to unscented lotion when skin starts to feel dry<br>
        • Avoid direct sunlight on your tattoo<br>
        • Don't pick at peeling skin
      </p>
    </div>

    <div class="step">
      <h3>Long-term Care</h3>
      <p>
        • Always use SPF 50+ sunscreen on your tattoo when exposed to the sun<br>
        • Keep skin moisturized for the best appearance<br>
        • Schedule touch-ups if needed (we offer free touch-ups within 3 months)
      </p>
    </div>

    <div class="warning">
      <h3>Important Warnings</h3>
      <p>
        • Avoid swimming, saunas, baths, and hot tubs for at least 2 weeks<br>
        • No sun exposure or tanning beds until fully healed (2-4 weeks)<br>
        • Avoid tight clothing over the tattoo during healing<br>
        • Don't scratch your tattoo even if it itches<br>
        • Contact your doctor if you notice unusual redness, swelling, warmth, or discharge
      </p>
    </div>

    <p>For more detailed information and visual guides, please log in to your client portal:</p>

    <center>
      <a href="${clientPortalLink}" class="button">View In Client Portal</a>
    </center>

    <p>If you have any questions or concerns about your healing process, please don't hesitate to contact us at ${studioPhone} or ${studioEmail}.</p>

    <p>
      Best regards,<br>
      ${artistName}<br>
      ${studioName}
    </p>

    <div class="footer">
      <p>
        ${studioName}<br>
        ${studioAddress}<br>
        ${studioPhone} | <a href="mailto:${studioEmail}">${studioEmail}</a> | <a href="${studioWebsite}">${studioWebsite}</a>
      </p>
      <p>© ${new Date().getFullYear()} ${studioName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
TATTOO AFTERCARE INSTRUCTIONS | ${studioName}

Hello ${clientName},

Thank you for choosing us for your ${tattooType} tattoo! We hope you're enjoying your new ink. To ensure your tattoo heals properly and maintains its quality, please follow these aftercare instructions carefully.

TATTOO AFTERCARE INSTRUCTIONS

Day 1-3: Initial Care
- Leave the bandage on for 2-4 hours
- Gently wash with unscented antibacterial soap
- Apply a thin layer of recommended aftercare ointment
- Wash 2-3 times daily

Day 4-14: Healing Process
- Continue washing 2-3 times daily
- Switch to unscented lotion when skin starts to feel dry
- Avoid direct sunlight on your tattoo
- Don't pick at peeling skin

Long-term Care
- Always use SPF 50+ sunscreen on your tattoo when exposed to the sun
- Keep skin moisturized for the best appearance
- Schedule touch-ups if needed (we offer free touch-ups within 3 months)

IMPORTANT WARNINGS
- Avoid swimming, saunas, baths, and hot tubs for at least 2 weeks
- No sun exposure or tanning beds until fully healed (2-4 weeks)
- Avoid tight clothing over the tattoo during healing
- Don't scratch your tattoo even if it itches
- Contact your doctor if you notice unusual redness, swelling, warmth, or discharge

For more detailed information and visual guides, please log in to your client portal: ${clientPortalLink}

If you have any questions or concerns about your healing process, please don't hesitate to contact us at ${studioPhone} or ${studioEmail}.

Best regards,
${artistName}
${studioName}

---
${studioName}
${studioAddress}
${studioPhone} | ${studioEmail} | ${studioWebsite}
© ${new Date().getFullYear()} ${studioName}. All rights reserved.
  `;

  return {
    subject,
    html,
    text,
  };
}