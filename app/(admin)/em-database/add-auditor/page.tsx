"use client";

import { useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function AddAuditorPage() {
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
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, link: `${BASE_URL}/auditor/${email}` }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("✅ Email sent successfully!");
        setEmail(""); // clear input after success
      } else {
        setStatus("error");
        setMessage("❌ Failed to send email. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("⚠️ An error occurred while sending the email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-1/2 mx-auto mt-10 p-6 rounded-2xl shadow-md bg-white">
      <h1 className="text-2xl font-semibold mb-4">Add External Auditor</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            id="email"
            type="email"
            value={email}
            placeholder="Enter email address"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition 
            ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-pes hover:bg-blue-700"}`}
        >
          {isLoading ? "Sending..." : "Send Invitation"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
