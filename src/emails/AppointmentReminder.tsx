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

export const AppointmentReminder: React.FC<AppointmentReminderProps> = ({
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
}) => {
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

  return (
    <Html>
      <Head />
      <Preview>Reminder: Your tattoo appointment is coming up!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env['WEBSITE_URL']}/images/logo.png`}
            width="120"
            height="50"
            alt={studioName}
            style={logo}
          />

          <Heading style={h1}>Appointment Reminder</Heading>

          <Text style={paragraph}>Hello {customerName},</Text>

          <Text style={paragraph}>
            This is a friendly reminder that your tattoo appointment is{' '}
            {daysRemaining <= 1 ? 'tomorrow' : `in ${daysRemaining} days`}. We&apos;re looking
            forward to seeing you!
          </Text>

          <Section style={appointmentDetails}>
            <Heading as="h2" style={h2}>
              Appointment Details
            </Heading>

            <Text style={detailText}>
              <strong>Date:</strong> {formattedDate}
            </Text>

            <Text style={detailText}>
              <strong>Time:</strong> {appointmentTime}
            </Text>

            <Text style={detailText}>
              <strong>Artist:</strong> {artistName}
            </Text>

            <Text style={detailText}>
              <strong>Type:</strong> {appointmentType}
            </Text>

            <Text style={detailText}>
              <strong>Location:</strong> {studioAddress}
            </Text>

            <Text style={detailText}>
              <strong>Appointment ID:</strong> {appointmentId}
            </Text>
          </Section>

          <Section style={preparationSection}>
            <Heading as="h2" style={h2}>
              Preparation Tips
            </Heading>

            <Text style={paragraph}>
              To ensure the best experience for your tattoo session, please:
            </Text>

            <ul>
              {preparationTips.map((tip, index) => (
                <li key={index} style={listItem}>
                  {tip}
                </li>
              ))}
            </ul>
          </Section>

          <Section style={actionSection}>
            <Button
              style={button}
              href={`${process.env['WEBSITE_URL']}/appointments/${appointmentId}`}
            >
              View Appointment Details
            </Button>

            <Text style={smallText}>
              Need to reschedule? Please contact us at least 48 hours in advance.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions, please contact us at {studioPhone}.
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

const paragraph = {
  color: '#4f4f4f',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
};

const appointmentDetails = {
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '6px',
  margin: '20px 0',
};

const detailText = {
  color: '#4f4f4f',
  fontSize: '16px',
  margin: '10px 0',
};

const preparationSection = {
  margin: '20px 0',
};

const actionSection = {
  margin: '25px 0',
  textAlign: 'center' as const,
};

const listItem = {
  color: '#4f4f4f',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '8px 0',
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

const smallText = {
  color: '#6f6f6f',
  fontSize: '14px',
  fontStyle: 'italic',
  textAlign: 'center' as const,
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

export default AppointmentReminder;
