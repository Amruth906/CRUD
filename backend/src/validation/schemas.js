const { z } = require("zod");

const phoneRegex = /^[0-9]{10}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

const addressInputSchema = z.object({
  line1: z.string().trim().min(3),
  line2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  country: z.string().trim().default("India"),
  pincode: z.string().trim().regex(pincodeRegex, "Invalid pincode"),
  is_primary: z.boolean().optional(),
});

const customerCreateSchema = z.object({
  first_name: z.string().trim().min(2),
  last_name: z.string().trim().min(2),
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  address: addressInputSchema.optional(),
});

const customerUpdateSchema = z.object({
  first_name: z.string().trim().min(2).optional(),
  last_name: z.string().trim().min(2).optional(),
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number").optional(),
  email: z.string().email().optional().or(z.literal("")),
});

const addressUpdateSchema = addressInputSchema.partial();

module.exports = {
  customerCreateSchema,
  customerUpdateSchema,
  addressInputSchema,
  addressUpdateSchema,
};
