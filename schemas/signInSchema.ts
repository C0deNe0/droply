import * as z from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "Email is reqired " })
    .email({ message: "please enter a valid email" }),

  password: z
    .string()
    .min(1, { message: "password is required" })
    .min(8, { message: "Password should atleast 8 character" }),
});
