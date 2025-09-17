"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
//zod custom schema
import { signUpSchema } from "@/schemas/signUpSchema";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //this is from clerk

  const { signUp, isLoaded, setActive } = useSignUp();

  //this states that this form will use the zod schema for validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfimation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      //create a new user in clerk
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      //send a verification email to the user
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      //move to the verification step
      //because based on this verifying state we will render the verification form
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
        console.log("Verification error", result);
        setVerificationError("verification could not be completed");
      }
    } catch (error: any) {
      console.log("Verification error", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "An error occurred during verification. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md mx-auto border border-default-200 bg-default-60 shadow-xl">
        <CardHeader className="flex flex-col gap-1  items-center pb-2">
          <h1 className="text-2xl font-semibold text-default-700">
            Verify your email
          </h1>
          <p className="text-center text-default-500">
            We sent a verification code to your email address. Please enter it
            below:
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {/* //if there is an verification error show it */}
          {verificationError && (
            <div className="text-red-400 bg-red-800 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p>{verificationError}</p>
            </div>
          )}
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-default-900"
              >
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="Enter your verification code"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
          <div>
            <p className="text-sm text-default-500">Didnt receive the code? </p>
            <button
              className="text-primary hover:underline font-medium"
              onClick={async () => {
                if (signUp) {
                  await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                  });
                }
              }}
            >
              Resend
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md  border border-default-200 bg-default-60 shadow-xl">
      <CardHeader className="flex flex-col gap-1  items-center pb-2">
        <h1 className="text-2xl font-semibold text-default-700">
          Create an account
        </h1>
        <p className="text-center text-default-500">Sign up to get started!</p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {/* if auth error this component will be shown */}
        {authError && (
          <div className="bg-danger-100 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-default-900"
            >
              Email
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              id="email"
              startContent={<Mail className="h-5 w-5 text-default-500" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              className="w-full"
            />
          </div>

          {/* password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-default-900"
            >
              Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              id="password"
              startContent={<Lock className="h-5 w-5 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          {/* confirm password */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-default-900"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              startContent={<Lock className="h-5 w-5 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.passwordConfimation}
              errorMessage={errors.passwordConfimation?.message}
              {...register("passwordConfimation")}
              className="w-full"
            />
          </div>

          {/* policy checker */}
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-default-500 mt-0.5" />
              <p className="text-sm text-default-600 ">
                By signing up, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>

          {/* submit button */}
          <button
            type="submit"
            color="primary"
            className="w-full"
            // isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Account Created"}
          </button>
        </form>
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600 ">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
