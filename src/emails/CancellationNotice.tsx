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

export const CancellationNotice: React.FC<CancellationNoticeProps> = ({
  customerName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  studioName,
  studioPhone,
  reason,
  depositAmount,
  isRefundable,
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
      <Preview>Your tattoo appointment has been cancelled</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env['WEBSITE_URL']}/images/logo.png`}
            width="120"
            height="50"
            alt={studioName}
            style={logo}
          />

          <Heading style={h1}>Appointment Cancellation</Heading>

          <Text style={paragraph}>Hello {customerName},</Text>

          <Text style={paragraph}>
            We&apos;re writing to inform you that your tattoo appointment has been cancelled.
          </Text>

          <Section style={appointmentDetails}>
            <Heading as="h2" style={h2}>
              Cancelled Appointment Details
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

          <Section style={reasonSection}>
            <Heading as="h2" style={h2}>
              Reason for Cancellation
            </Heading>

            <Text style={paragraph}>{reason}</Text>
          </Section>

          {depositAmount > 0 && (
            <Section style={depositSection}>
              <Heading as="h2" style={h2}>
                Deposit Information
              </Heading>

              {isRefundable ? (
                <>
                  <Text style={paragraph}>
                    Your deposit of ${depositAmount.toFixed(2)} will be refunded to your original
                    payment method within 5-7 business days.
                  </Text>

                  <Text style={smallText}>
                    If you don&apos;t see the refund after 7 business days, please contact us.
                  </Text>
                </>
              ) : (
                <Text style={paragraph}>
                  As per our cancellation policy, your deposit of ${depositAmount.toFixed(2)} is
                  non-refundable. However, we'd be happy to discuss applying it to a future
                  appointment.
                </Text>
              )}
            </Section>
          )}

          <Section style={rescheduleSection}>
            <Heading as="h2" style={h2}>
              Would you like to reschedule?
            </Heading>

            <Text style={paragraph}>
              We'd love to find another time for your tattoo. You can reschedule using our online
              booking system or by contacting us directly.
            </Text>

            <Button pX={20} pY={12} style={button} href={`${process.env['WEBSITE_URL']}/booking`}>
              Book a New Appointment
            </Button>
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

const reasonSection = {
  margin: '20px 0',
  borderLeft: '4px solid #f0f0f0',
  paddingLeft: '15px',
};

const depositSection = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: isRefundable => (isRefundable ? '#f0f9eb' : '#fafafa'),
  borderRadius: '6px',
};

const rescheduleSection = {
  margin: '25px 0',
  textAlign: 'center' as const,
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
  margin: '10px 0',
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

export default CancellationNotice;
