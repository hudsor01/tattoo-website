-- CreateView for customers (maps to Customer model)
CREATE VIEW "customers" AS
SELECT
  id,
  "firstName" as firstName,
  "lastName" as lastName,
  email,
  phone,
  "avatarUrl" as avatar_url,
  address,
  city,
  state,
  "postalCode" as postalCode,
  country,
  "birthDate" as birthDate,
  notes,
  allergies,
  source,
  tags,
  "createdAt" as createdAt,
  "updatedAt" as updatedAt
FROM "Customer";

-- CreateView for clients_summary (extended view of customers with more info)
CREATE VIEW "clients_summary" AS
SELECT
  id,
  "firstName" as firstName,
  "lastName" as lastName,
  email,
  phone,
  "avatarUrl" as avatar_url,
  address,
  city,
  state,
  "postalCode" as postalCode,
  country,
  "birthDate" as birthDate,
  notes,
  allergies,
  source,
  tags,
  "createdAt" as createdAt,
  "updatedAt" as updatedAt,
  CONCAT("firstName", ' ', "lastName") as fullName
FROM "Customer";

-- CreateView for appointments (maps to Appointment model)
CREATE VIEW "appointments" AS
SELECT
  a.id,
  a.title,
  a.description,
  a."startDate" as startTime,
  a."endDate" as endTime,
  a.status,
  a.deposit,
  a.deposit > 0 AND a.status = 'confirmed' as depositPaid,
  a."totalPrice" as totalPrice,
  a."designNotes" as designNotes,
  a.location,
  a."followUpDate" as followUpDate,
  a."createdAt" as createdAt,
  a."updatedAt" as updatedAt,
  a."customerId" as customerId,
  a."artistId" as artist_id
FROM "Appointment" a;

-- CreateView for appointments_summary (extended view of appointments with customer and artist info)
CREATE VIEW "appointments_summary" AS
SELECT
  a.id,
  a.title,
  a.description,
  a."startDate" as startTime,
  a."endDate" as endTime,
  a.status,
  a.deposit,
  a.deposit > 0 AND a.status = 'confirmed' as depositPaid,
  a."totalPrice" as totalPrice,
  a."designNotes" as designNotes,
  a.location,
  a."followUpDate" as followUpDate,
  a."createdAt" as createdAt,
  a."updatedAt" as updatedAt,
  a."customerId" as customerId,
  CONCAT(c."firstName", ' ', c."lastName") as customerName,
  c.email as customerEmail,
  c.phone as customerPhone,
  a."artistId" as artist_id,
  u.name as artist_name,
  u.email as artist_email
FROM "Appointment" a
LEFT JOIN "Customer" c ON a."customerId" = c.id
LEFT JOIN "Artist" art ON a."artistId" = art.id
LEFT JOIN "User" u ON art."userId" = u.id;

-- CreateView for tattoo_designs (maps to TattooDesign model)
CREATE VIEW "tattoo_designs" AS
SELECT
  id,
  name as title,
  description,
  "fileUrl" as file_url,
  "thumbnailUrl" as thumbnail_url,
  "designType" as design_type,
  size,
  "isApproved" as is_approved,
  "approvedAt" as approved_at,
  "createdAt" as createdAt,
  "updatedAt" as updatedAt,
  "artistId" as artist_id,
  "customerId" as customerId
FROM "TattooDesign";

-- CreateView for campaign_recipients (for email marketing functionality)
CREATE VIEW "campaign_recipients" AS
SELECT
  c.id,
  c.email,
  CONCAT(c."firstName", ' ', c."lastName") as name,
  c.tags,
  c."createdAt" as createdAt,
  c."updatedAt" as updatedAt,
  NULL as campaign_id,
  NULL as sent_at,
  NULL as opened_at,
  NULL as clicked_at,
  'pending' as status
FROM "Customer" c
WHERE c.email IS NOT NULL;