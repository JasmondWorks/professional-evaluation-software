"use client";

import { useState } from "react";
import Link from "next/link";

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
      <Link href="/em-database" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-pes transition-colors mb-6 group">
        <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Database
      </Link>
      
      <h1 className="text-2xl font-semibold mb-6">Add External Auditor</h1>

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
