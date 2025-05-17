import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components';

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

export const DepositReminder: React.FC<DepositReminderProps> = ({
  customerName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  studioName,
  depositAmount,
  paymentLink,
  dueDate,
}) => {
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

  return (
    <Html>
      <Head />
      <Preview>Reminder: Deposit needed for your upcoming tattoo appointment</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env['WEBSITE_URL']}/images/logo.png`}
            width="120"
            height="50"
            alt={studioName}
            style={logo}
          />

          <Heading style={h1}>Deposit Reminder</Heading>

          <Text style={paragraph}>Hello {customerName},</Text>

          <Text style={paragraph}>
            This is a friendly reminder that your deposit for the upcoming tattoo appointment has
            not been received yet. To secure your appointment, please make your deposit payment as
            soon as possible.
          </Text>

          <Section style={depositSection}>
            <Heading as="h2" style={h2}>
              Deposit Details
            </Heading>

            <Text style={detailText}>
              <strong>Amount Due:</strong> ${depositAmount.toFixed(2)}
            </Text>

            <Text style={detailText}>
              <strong>Due By:</strong> {formattedDueDate}
            </Text>

            <Button pX={20} pY={12} style={button} href={paymentLink}>
              Make Payment Now
            </Button>
          </Section>

          <Section style={appointmentDetails}>
            <Heading as="h2" style={h2}>
              Appointment Information
            </Heading>

            <Text style={detailText}>
              <strong>Date:</strong> {formattedDate}
            </Text>

            <Text style={detailText}>
              <strong>Time:</strong> {appointmentTime}
            </Text>

            <Text style={detailText}>
              <strong>Type:</strong> {appointmentType}
            </Text>
          </Section>

          <Section style={policySection}>
            <Heading as="h3" style={h3}>
              Deposit Policy
            </Heading>

            <Text style={policyText}>
              Deposits are required to secure your appointment time with your artist. If the deposit
              is not received by the due date, your appointment may be cancelled and the time slot
              offered to another client.
            </Text>

            <Text style={policyText}>
              Deposits are non-refundable but will be applied to the total cost of your tattoo.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              If you've already made your payment, please disregard this message. If you have any
              questions or need assistance with your payment, please reply to this email.
            </Text>

            <Text style={footerText}>
              &copy; {new Date().getFullYear()} {studioName}. All rights reserved.
            </Text>

            <Text style={footerLinks}>
              <Link href={`${process.env['WEBSITE_URL']}`} style={link}>
                Website
              </Link>{' '}
              •{' '}
              <Link href={`${process.env['WEBSITE_URL']}/faq`} style={link}>
                FAQ
              </Link>{' '}
              •{' '}
              <Link href={`${process.env['WEBSITE_URL']}/policies`} style={link}>
                Policies
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
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
  padding: '20px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const logo = {
  margin: '0 auto 20px',
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

const h2 = {
  color: '#333333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '15px 0',
  padding: '0',
};

const h3 = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '12px 0',
  padding: '0',
};

const paragraph = {
  color: '#4f4f4f',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
};

const depositSection = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
  textAlign: 'center' as const,
  border: '1px solid #eaeaea',
};

const appointmentDetails = {
  padding: '15px',
  borderRadius: '6px',
  margin: '20px 0',
  backgroundColor: '#f9f9f9',
};

const detailText = {
  color: '#4f4f4f',
  fontSize: '16px',
  margin: '10px 0',
};

const policySection = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f0f0f0',
  borderRadius: '6px',
};

const policyText = {
  color: '#4f4f4f',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '10px 0',
};

const button = {
  backgroundColor: '#9333ea',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  margin: '20px auto',
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

const footerLinks = {
  color: '#6f6f6f',
  fontSize: '14px',
  margin: '8px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#9333ea',
  textDecoration: 'underline',
};

export default DepositReminder;
