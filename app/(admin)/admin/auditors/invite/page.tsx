"use client";

import { useState } from "react";
import { apiFetch } from '@/app/utils/apiFetch';
import { BackLink, Button, Input } from '@/app/components/ui';

// Platform-admin only: external auditors are invited centrally, reviewed by
// the platform admin, and only afterward chosen by orgs (em-database/add-auditor).
export default function InviteAuditorPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setStatus("");

    try {
      const response = await apiFetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, origin: window.location.origin }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("✅ Invitation sent successfully!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage("❌ Failed to send invitation. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("⚠️ An error occurred while sending the invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-1/2 mx-auto mt-10 p-6 rounded-2xl shadow-md bg-white">
      <BackLink href="/admin/auditors" className="mb-6">Back to Auditors</BackLink>

      <h1 className="text-2xl font-semibold mb-2">Invite External Auditor</h1>
      <p className="text-sm text-muted mb-6">
        They&apos;ll answer a questionnaire and submit credentials for your
        review. Once approved and publicly recognized, organizations can
        choose to work with them.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          value={email}
          placeholder="Enter email address"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={isLoading} loading={isLoading} className="w-full">
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            status === "success" ? "text-green-600" : "text-danger-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
