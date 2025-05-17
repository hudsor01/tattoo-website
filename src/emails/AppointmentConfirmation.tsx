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

export const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
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
}) => {
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Your tattoo appointment has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env['WEBSITE_URL']}/images/logo.png`}
            width="120"
            height="50"
            alt={studioName}
            style={logo}
          />

          <Heading style={h1}>Appointment Confirmation</Heading>

          <Text style={paragraph}>Hello {customerName},</Text>

          <Text style={paragraph}>
            Your tattoo appointment has been confirmed! We&apos;re looking forward to seeing you.
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

          {depositAmount > 0 && (
            <Section style={depositSection}>
              <Heading as="h2" style={h2}>
                Deposit Information
              </Heading>

              <Text style={paragraph}>
                To secure your appointment, a deposit of ${depositAmount.toFixed(2)} is required.
              </Text>

              <Button
                style={{ ...button, padding: '12px 20px' }}
                href={`${process.env['WEBSITE_URL']}/payment/${appointmentId}`}
              >
                Pay Deposit Now
              </Button>

              <Text style={smallText}>
                Deposit must be paid within 48 hours to keep your booking.
              </Text>
            </Section>
          )}

          <Section style={preparationSection}>
            <Heading as="h2" style={h2}>
              Preparation for Your Appointment
            </Heading>

            <Text style={paragraph}>
              To ensure the best experience for your tattoo session, please:
            </Text>

            <ul>
              <li style={listItem}>Get a good night&apos;s sleep before your appointment</li>
              <li style={listItem}>Eat a meal before arriving</li>
              <li style={listItem}>Stay hydrated</li>
              <li style={listItem}>
                Wear comfortable clothing that allows easy access to the tattoo area
              </li>
              <li style={listItem}>
                Consider bringing headphones and something to keep you occupied
              </li>
            </ul>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              If you need to reschedule or have any questions, please contact us at {studioPhone} at
              least 48 hours before your appointment.
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

const depositSection = {
  borderTop: '1px solid #eaeaea',
  borderBottom: '1px solid #eaeaea',
  margin: '20px 0',
  padding: '20px 0',
};

const preparationSection = {
  margin: '20px 0',
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

export default AppointmentConfirmation;
