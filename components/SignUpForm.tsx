"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
//zod custom schema
import { signUpSchema } from "@/schemas/signUpSchema";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const { signUp, isLoaded, setActive } = useSignUp();

  const {
    register,
    handlesubmit,
    formstate: { error },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfimation: "",
    },
  });

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
        });
        router.push("/dashboard");
      } else {
        console.error("verification incomplete", result);
        setVerificationError("verification could not be completed");
      }
    } catch (error: any) {
      setVerificationError(
        error.errors?.[0]?.message ||
          "An error occurred during verification. Please try again later."
      );
    } finally {
        setIsSubmitting(false)
  };

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerifying(true);
    } catch (error: any) {
      console.error("SignUp error", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign up. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async () => {};

  if (verifying) {
    return <h1>Hello there</h1>;
  }
}
