"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "iconsax-react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import { notify } from "@/lib/toast";
import { apiFetch } from '@/app/utils/apiFetch';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Inline error state for the specific network/server error message.
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    const toastId = notify.loading("Sending reset link…");

    try {
      const response = await apiFetch("/api/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        notify.dismiss(toastId);
        notify.success(
          "Reset link sent",
          "If an account exists with this email, a password reset link has been sent.",
        );
        setEmail("");
      } else {
        const errorText = data.error || "Failed to send reset link";
        setErrorMessage(errorText);
        notify.dismiss(toastId);
        notify.error(errorText);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorText =
        "Unable to reach the server. Please check your connection and try again.";
      setErrorMessage(errorText);
      notify.dismiss(toastId);
      notify.error(errorText);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="form w-full flex flex-col">
      <div className="mb-6 space-y-3">
          <Button href="/login" variant="ghost">
            <ArrowLeft size={20} />
            Back to Login
          </Button>
          <h1 className="text-4xl font-semibold mb-2">Forgot Password?</h1>
          <p className="text-body">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded bg-red-100 text-red-700 border border-red-400"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input flex flex-col justify-center mb-6">
            <label htmlFor="email" className="mb-2 font-medium">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-line text-body focus:outline-blue-600 px-4 py-3 rounded-lg"
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
              tabIndex={1}
            />
          </div>

          <Button
            className="w-full text-center"
            type="submit"
            disabled={isSubmitting}
            tabIndex={2}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>

          <p className="text-center text-body mt-4">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-pes hover:text-[#141444] font-medium"
            >
              Sign In
            </Link>
          </p>
      </form>
    </div>
  );
}
