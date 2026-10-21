import { z } from "zod"
import { required } from "./messages"

// Pagly: required fields say so in the admin's language.
export const addressSchema = z.object({
  country_code: z.string().min(1, required),
  first_name: z.string().min(1, required),
  last_name: z.string().min(1, required),
  address_1: z.string().min(1, required),
  address_2: z.string().nullish(),
  company: z.string().nullish(),
  city: z.string().min(1, required),
  province: z.string().nullish(),
  postal_code: z.string().min(1, required),
  phone: z.string().nullish(),
})
