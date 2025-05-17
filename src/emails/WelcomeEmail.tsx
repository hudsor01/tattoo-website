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

interface WelcomeEmailProps {
  firstName: string;
  studioName: string;
  studioWebsite: string;
  instagramHandle: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  firstName,
  studioName,
  studioWebsite,
  instagramHandle,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {studioName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env['WEBSITE_URL']}/images/logo.png`}
            width="120"
            height="50"
            alt={studioName}
            style={logo}
          />

          <Heading style={h1}>Welcome to {studioName}!</Heading>

          <Text style={paragraph}>Hello {firstName},</Text>

          <Text style={paragraph}>
            Thank you for creating an account with us. We&apos;re excited to have you join our
            tattoo community! With your new account, you can:
          </Text>

          <Section style={featuresSection}>
            <div style={featureItem}>
              <Text style={featureText}>🗓️ Book appointments online</Text>
            </div>

            <div style={featureItem}>
              <Text style={featureText}>📱 Manage your appointments and consultations</Text>
            </div>

            <div style={featureItem}>
              <Text style={featureText}>💡 Submit tattoo ideas and receive design feedback</Text>
            </div>

            <div style={featureItem}>
              <Text style={featureText}>
                📸 Access your tattoo photos and aftercare instructions
              </Text>
            </div>
          </Section>

          <Section style={actionSection}>
            <Button pX={20} pY={12} style={button} href={studioWebsite}>
              Visit Your Account
            </Button>
          </Section>

          <Section style={socialSection}>
            <Heading as="h2" style={h2}>
              Connect With Us
            </Heading>

            <Text style={paragraph}>
              Follow us on Instagram{' '}
              <Link href={`https://instagram.com/${instagramHandle.replace('@', '')}`} style={link}>
                {instagramHandle}
              </Link>{' '}
              to see our latest work, flash designs, and studio updates.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>We look forward to creating amazing tattoos with you!</Text>

            <Text style={footerText}>
              &copy; {new Date().getFullYear()} {studioName}. All rights reserved.
            </Text>

            <Text style={footerLinks}>
              <Link href={studioWebsite} style={link}>
                Website
              </Link>{' '}
              •{' '}
              <Link href={`${studioWebsite}/faq`} style={link}>
                FAQ
              </Link>{' '}
              •{' '}
              <Link href={`${studioWebsite}/contact`} style={link}>
                Contact Us
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

const featuresSection = {
  margin: '25px 0',
};

const featureItem = {
  margin: '12px 0',
};

const featureText = {
  color: '#4f4f4f',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const actionSection = {
  margin: '30px 0',
  textAlign: 'center' as const,
};

const socialSection = {
  margin: '30px 0',
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '6px',
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

export default WelcomeEmail;
