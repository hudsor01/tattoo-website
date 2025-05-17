import { test, expect } from './setup';
import { v4 as uuidv4 } from 'uuid';

test.describe('CRM Functionality', () => {
  test('can manage customer relationships', async ({ prisma, testPrefix }) => {
    // Create a customer
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: `${testPrefix}CRM`,
        lastName: 'Customer',
        email: `${testPrefix}crm@example.com`,
        phone: '5551234567',
      },
    });
    
    expect(customer).toBeDefined();
    
    // Add notes to the customer
    const note1 = await prisma.note.create({
      data: {
        id: uuidv4(),
        content: 'Initial consultation note',
        type: 'manual',
        customerId: customer.id,
      },
    });
    
    const note2 = await prisma.note.create({
      data: {
        id: uuidv4(),
        content: 'Follow-up discussion about design',
        type: 'manual',
        customerId: customer.id,
      },
    });
    
    // Create an interaction record
    const interaction = await prisma.interaction.create({
      data: {
        id: uuidv4(),
        type: 'email',
        subject: 'Design Discussion',
        content: 'Discussed tattoo design options',
        direction: 'outbound',
        outcome: 'positive',
        customerId: customer.id,
      },
    });
    
    expect(interaction).toBeDefined();
    expect(interaction.type).toBe('email');
    
    // Create a tag
    const tag = await prisma.tag.findFirst({
      where: { name: 'VIP' },
    }) || await prisma.tag.create({
      data: {
        id: uuidv4(),
        name: 'VIP',
        color: 'gold',
      },
    });
    
    // Connect tag to customer via junction table
    await prisma.$executeRaw`
      INSERT INTO "_CustomerToTag" ("A", "B")
      VALUES (${customer.id}, ${tag.id})
      ON CONFLICT DO NOTHING
    `;
    
    // Retrieve customer with all relationships
    const fullCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: {
        notes: true,
        interactions: true,
        tags: true,
      },
    });
    
    expect(fullCustomer?.notes).toHaveLength(2);
    expect(fullCustomer?.interactions).toHaveLength(1);
    
    // Clean up
    await prisma.note.deleteMany({
      where: { customerId: customer.id },
    });
    
    await prisma.interaction.delete({
      where: { id: interaction.id },
    });
    
    await prisma.$executeRaw`
      DELETE FROM "_CustomerToTag"
      WHERE "A" = ${customer.id} AND "B" = ${tag.id}
    `;
    
    await prisma.customer.delete({
      where: { id: customer.id },
    });
  });
});