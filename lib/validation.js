// Zod schema for the onboarding form submitted at /api/get-started/complete.

const { z } = require('zod');

const getStartedSchema = z.object({
  sessionId: z.string().min(1, 'Missing session ID.'),
  businessName: z.string().trim().min(1, 'Business name is required.'),
  contactName: z.string().trim().min(1, 'Contact name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  // Deliberately no format/regex validation — international numbers,
  // extensions, spacing all vary too much to gatekeep here.
  phone: z.string().trim().min(1, 'Phone number is required.'),
  websiteUrl: z.string().trim().optional().or(z.literal('')),
  streetAddress: z.string().trim().min(1, 'Street address is required.'),
  city: z.string().trim().min(1, 'City is required.'),
  region: z.string().trim().min(1, 'State/region is required.'),
  postcode: z.string().trim().min(1, 'Postcode is required.'),
  industry: z.string().trim().min(1, 'Primary service/industry is required.'),
  keywords: z.string().trim().optional().or(z.literal('')),
  competitors: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
});

// Zod schema for the lead-magnet (ebook/guide) forms — e.g.
// /free-seo-ebook/. Shared across all lead magnets; per-resource
// differences live in lib/leadMagnets.js, not here.
const leadMagnetSchema = z.object({
  resource: z.string().trim().min(1, 'Missing resource.'),
  fullName: z.string().trim().min(1, 'Full name is required.'),
  companyName: z.string().trim().min(1, 'Business/company name is required.'),
  email: z.string().trim().email('Enter a valid work email address.'),
  // Deliberately no format/regex validation — same reasoning as
  // getStartedSchema's phone field.
  phone: z.string().trim().min(1, 'Phone number is required.'),
  websiteUrl: z.string().trim().min(1, 'Website URL is required.'),
  challenge: z.string().trim().optional().or(z.literal('')),
  // Honeypot — real visitors never fill this in (it's hidden via CSS).
  // A non-empty value here is a strong spam signal, checked by the
  // handler rather than by Zod (silently succeed, don't tip off bots).
  company_website: z.string().optional().or(z.literal('')),
});

module.exports = { getStartedSchema, leadMagnetSchema };
