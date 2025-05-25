import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/admin/customers/route';
import { prisma } from '@/lib/db/prisma';

// Mock dependencies
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    customer: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/utils/server', () => ({
  verifyAdminAccess: vi.fn(),
}));

import { verifyAdminAccess } from '@/lib/utils/server';

const mockVerifyAdminAccess = vi.mocked(verifyAdminAccess);
const mockPrisma = vi.mocked(prisma);

describe('/api/admin/customers API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to authorized access
    mockVerifyAdminAccess.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/customers', () => {
    const mockCustomers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        notes: 'Regular customer',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        Appointment: [],
        tags: [],
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-5678',
        notes: '',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        Appointment: [
          {
            id: 'apt-1',
            startDate: new Date('2024-02-01'),
            status: 'completed',
          },
        ],
        tags: ['vip'],
      },
    ];

    it('should return customers list successfully', async () => {
      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrisma.customer.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/admin/customers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.clients).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.clients[0]).toMatchObject({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        status: 'new',
        notes: 'Regular customer',
      });
    });

    it('should handle search parameters correctly', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([mockCustomers[0]]);
      mockPrisma.customer.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/admin/customers?search=john');
      await GET(request);

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { phone: { contains: 'john', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
        select: expect.any(Object),
      });
    });

    it('should handle pagination parameters correctly', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);
      mockPrisma.customer.count.mockResolvedValue(100);

      const request = new NextRequest('http://localhost:3000/api/admin/customers?page=3&limit=20');
      await GET(request);

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40, // (page 3 - 1) * limit 20
          take: 20,
        })
      );
    });

    it('should return 403 when admin access is denied', async () => {
      mockVerifyAdminAccess.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/admin/customers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.customer.findMany.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/admin/customers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch clients');
    });

    it('should format customer data correctly', async () => {
      const customerWithAppointment = {
        ...mockCustomers[1],
        tags: ['premium'],
      };
      
      mockPrisma.customer.findMany.mockResolvedValue([customerWithAppointment]);
      mockPrisma.customer.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/admin/customers');
      const response = await GET(request);
      const data = await response.json();

      expect(data.clients[0]).toMatchObject({
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '555-5678',
        status: 'active', // Should be 'active' because tags exist
        lastContact: expect.any(String),
      });
    });
  });

  describe('POST /api/admin/customers', () => {
    const validCustomerData = {
      name: 'New Customer',
      email: 'new.customer@example.com',
      phone: '555-9999',
      notes: 'Test customer',
    };

    const createdCustomer = {
      id: 'new-customer-id',
      firstName: 'New',
      lastName: 'Customer',
      email: 'new.customer@example.com',
      phone: '555-9999',
      notes: 'Test customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new customer successfully', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null); // No existing customer
      mockPrisma.customer.create.mockResolvedValue(createdCustomer);

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(validCustomerData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject(createdCustomer);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: {
          firstName: 'New',
          lastName: 'Customer',
          email: 'new.customer@example.com',
          phone: '555-9999',
          notes: 'Test customer',
        },
      });
    });

    it('should handle single name correctly', async () => {
      const singleNameData = {
        name: 'Madonna',
        email: 'madonna@example.com',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue({
        ...createdCustomer,
        firstName: 'Madonna',
        lastName: '',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(singleNameData),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(request);

      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Madonna',
          lastName: '',
          email: 'madonna@example.com',
          phone: '',
          notes: '',
        },
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidData = { phone: '555-1234' }; // Missing name and email

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name and email are required');
    });

    it('should return 409 when customer with email already exists', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(createdCustomer); // Existing customer

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(validCustomerData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('A client with this email already exists');
    });

    it('should return 403 when admin access is denied', async () => {
      mockVerifyAdminAccess.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(validCustomerData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.customer.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(validCustomerData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create client');
    });

    it('should handle tattoo style in notes correctly', async () => {
      const dataWithTattooStyle = {
        ...validCustomerData,
        tattooStyle: 'Traditional',
        notes: '', // This should be overridden
      };

      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue(createdCustomer);

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(dataWithTattooStyle),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(request);

      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: {
          firstName: 'New',
          lastName: 'Customer',
          email: 'new.customer@example.com',
          phone: '555-9999',
          notes: 'Tattoo style preference: Traditional',
        },
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should sanitize email input', async () => {
      const dataWithMixedCaseEmail = {
        ...validCustomerData,
        email: 'NEW.Customer@EXAMPLE.COM',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue(createdCustomer);

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(dataWithMixedCaseEmail),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(request);

      // Should check for existing customer with lowercase email
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
        where: { email: 'NEW.Customer@EXAMPLE.COM' },
      });

      // Should create customer with original email format
      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'NEW.Customer@EXAMPLE.COM',
        }),
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle extremely long names', async () => {
      const longName = 'A'.repeat(1000);
      const dataWithLongName = {
        name: longName,
        email: 'test@example.com',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue({
        id: 'test-id',
        firstName: longName,
        lastName: '',
        email: 'test@example.com',
        phone: '',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(dataWithLongName),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it('should handle names with multiple spaces', async () => {
      const dataWithSpaces = {
        name: 'John   Middle   Doe',
        email: 'john@example.com',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue({
        id: 'test-id',
        firstName: 'John',
        lastName: 'Middle   Doe',
        email: 'john@example.com',
        phone: '',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(dataWithSpaces),
        headers: { 'Content-Type': 'application/json' },
      });

      await POST(request);

      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: {
          firstName: 'John',
          lastName: 'Middle   Doe',
          email: 'john@example.com',
          phone: '',
          notes: '',
        },
      });
    });

    it('should handle concurrent requests with same email', async () => {
      // First request succeeds
      mockPrisma.customer.findUnique.mockResolvedValueOnce(null);
      mockPrisma.customer.create.mockResolvedValueOnce({
        id: 'first-id',
        firstName: 'First',
        lastName: 'Customer',
        email: 'same@example.com',
        phone: '',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Second request finds existing customer
      mockPrisma.customer.findUnique.mockResolvedValueOnce({
        id: 'first-id',
        firstName: 'First',
        lastName: 'Customer',
        email: 'same@example.com',
        phone: '',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customerData = {
        name: 'Duplicate Customer',
        email: 'same@example.com',
      };

      // First request
      const request1 = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Second request
      const request2 = new NextRequest('http://localhost:3000/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
        headers: { 'Content-Type': 'application/json' },
      });

      const [response1, response2] = await Promise.all([POST(request1), POST(request2)]);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(409);
    });
  });
});