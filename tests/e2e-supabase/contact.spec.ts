import { test, expect } from './setup';
import { v4 as uuidv4 } from 'uuid';

test.describe('Contact and Lead Management', () => {
  test('can create and process contact requests', async ({ prisma, testPrefix }) => {
    // Create a contact request
    const contact = await prisma.contact.create({
      data: {
        name: `${testPrefix}Contact Name`,
        email: `${testPrefix}contact@example.com`,
        subject: 'Test Contact Request',
        message: 'This is a test contact message created by E2E test.',
      },
    });
    
    expect(contact).toBeDefined();
    expect(contact.email).toBe(`${testPrefix}contact@example.com`);
    
    // Create a customer from this contact
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: `${testPrefix}Contact`,
        lastName: 'User',
        email: contact.email,
        phone: '5551234567',
      },
    });
    
    // Link the contact to the customer using Prisma update
    await prisma.contact.update({
      where: { id: contact.id },
      data: { customerId: customer.id }
    });
    
    // Fetch the updated contact to verify
    const updatedContact = await prisma.contact.findUnique({
      where: { id: contact.id }
    });
    
    expect(updatedContact.customerId).toBe(customer.id);
    
    // Clean up
    await prisma.contact.delete({
      where: { id: contact.id },
    });
    
    await prisma.customer.delete({
      where: { id: customer.id },
    });
  });
  
  test('can create and process lead magnet sign-ups', async ({ prisma, testPrefix }) => {
    // Create a lead magnet sign-up
    const lead = await prisma.lead.create({
      data: {
        name: `${testPrefix}Lead Name`,
        email: `${testPrefix}lead@example.com`,
        leadMagnetType: 'aftercare-guide',
      },
    });
    
    expect(lead).toBeDefined();
    expect(lead.email).toBe(`${testPrefix}lead@example.com`);
    
    // Create a customer from this lead
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: `${testPrefix}Lead`,
        lastName: 'User',
        email: lead.email,
        source: 'lead-magnet',
      },
    });
    
    // Link the lead to the customer
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        customerId: customer.id,
      },
    });
    
    expect(updatedLead.customerId).toBe(customer.id);
    
    // Clean up
    await prisma.lead.delete({
      where: { id: lead.id },
    });
    
    await prisma.customer.delete({
      where: { id: customer.id },
    });
  });
});