import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Pease enter a valid email" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "password should be atleast of 8 character" }),
    passwordConfimation: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.passwordConfimation, {
    message: "Password did not match",
    path: ["passwordConfimation"],
  });

// refine is used to add custom validation to the schema. In this case, we are checking if the password and passwordConfirmation fields match. If they don't, we add an error message to the passwordConfirmation field.
