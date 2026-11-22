"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";
import { Button, Input } from "@/app/components/ui";
import { AUDITOR_QUESTIONS } from "@/app/lib/auditorQuestions";
import { setAccessToken } from "@/app/utils/auth";
import { useAuth } from "@/app/components/useAuth";

export default function AuditorQuestionnairePage() {
  const { setRole } = useAuth();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submission, setSubmission] = useState<{
    status: string | null;
    globally_recognized?: boolean;
    global_recognition_status?: string | null;
  } | null>(null);

  const [responses, setResponses] = useState<string[]>(Array(AUDITOR_QUESTIONS.length).fill(""));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    gsm: "",
    address: "",
    dob: "",
    image: "",
  });

  const [credentialData, setCredentialData] = useState({
    c_origin: "",
    c_prof: "",
    c_acad: "",
    others: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/auditor-responses");
        const data = await res.json();
        setSubmission(data.submission ?? null);
      } finally {
        setLoadingStatus(false);
      }
    })();
  }, []);

  const handleResponseChange = (index: number, value: string) => {
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormComplete =
    formData.name.trim() !== "" &&
    formData.gsm.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.dob.trim() !== "" &&
    responses.every((r) => r.trim() !== "") &&
    Object.keys(selectedFiles).length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiFetch("/api/auditor-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, ...formData, credentialData }),
      });

      if (response.ok) {
        setMessage("✅ Submitted successfully! You're now active.");

        // The role claim doesn't change here (it's been 'auditor' since the
        // invite was created), but `name` does — this form just replaced the
        // email-derived placeholder with their real name, and the session
        // token still carries the old one until refreshed. Without this, the
        // sidebar/navbar would keep showing the placeholder until the token's
        // next periodic refresh.
        try {
          const refreshRes = await apiFetch("/api/refresh", { method: "POST" });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            setAccessToken(refreshData.token);
            setRole(refreshData.role);
            document.cookie = `role=${refreshData.role}; path=/`;
          }
        } catch {
          // Best-effort — the periodic refresh in AuthProvider will catch up.
        }

        // Re-fetch rather than guess the resulting state client-side — the
        // server is the one that knows whether a global recognition request
        // was seeded by this submission.
        const statusRes = await apiFetch("/api/auditor-responses");
        const statusData = await statusRes.json();
        setSubmission(statusData.submission ?? { status: "approved" });
      } else {
        setMessage("❌ Failed to submit.");
      }
    } catch (error) {
      setMessage("⚠️ An error occurred while submitting.");
    } finally {
      setLoading(false);
    }
  };

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const labelName = e.target.id;

    if (!file) return;

    setSelectedFiles((prev) => ({
      ...prev,
      [labelName]: file.name,
    }));

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "pes_unsigned");
    data.append("folder", `pes/credentials/${labelName}`);

    try {
      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/duvqe45ds/image/upload", {
        method: "POST",
        body: data,
      });
      const uploaded = await cloudRes.json();

      setCredentialData((prev) => ({
        ...prev,
        [labelName]: uploaded.secure_url,
      }));
    } catch (err) {
      // console.log(err);
    }
  }

  if (loadingStatus) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 rounded-2xl shadow-md bg-white text-pes text-center">
        <p className="text-xl font-medium animate-pulse">Loading…</p>
      </div>
    );
  }

  if (submission) {
    const removed = submission.status === "removed";
    return (
      <div className="max-w-3xl mx-auto mt-10 p-10 rounded-2xl shadow-md bg-white text-pes text-center space-y-4">
        <h1 className="text-2xl font-semibold">{removed ? "You're no longer active with this organization" : "You're active"}</h1>
        <p className="text-body font-medium">
          {removed
            ? "Contact your inviting organization for more information."
            : "Your onboarding is complete — you're active as an auditor for the organization that invited you."}
        </p>
        {!removed && submission.global_recognition_status === "pending" && (
          <p className="text-sm text-muted">
            Your request to be recognized globally is awaiting platform review.
          </p>
        )}
        {!removed && submission.global_recognition_status === "rejected" && !submission.globally_recognized && (
          <p className="text-sm text-muted">
            Your request to be recognized globally was not approved. Contact the platform admin for more information.
          </p>
        )}
        {!removed && submission.globally_recognized && (
          <p className="text-sm text-success-600">You are recognized globally by the platform.</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-fit overflow-scroll mt-10 p-6 rounded-2xl shadow-md bg-white text-pes">
      <h1 className="text-2xl font-semibold mb-6">Auditor Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>

          <Input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            required
          />

          <Input
            type="text"
            placeholder="GSM (Plus country code)"
            value={formData.gsm}
            onChange={(e) => handleFormChange("gsm", e.target.value)}
            required
          />

          <Input
            type="text"
            placeholder="Office Address"
            value={formData.address}
            onChange={(e) => handleFormChange("address", e.target.value)}
            required
          />

          <label htmlFor="dob" className="mt-2">
            <span className="text-muted mt-2 m-1">Date of birth</span>
            <input
              type="date"
              id="dob"
              placeholder="Date of Birth"
              value={formData.dob}
              onChange={(e) => handleFormChange("dob", e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </label>
        </div>

        {/* Yes/No Questions */}
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold">Auditor's Questionnaire</h2>

          {AUDITOR_QUESTIONS.map((question, index) => (
            <div key={index} className="space-y-2">
              <label className="block font-medium">
                {index + 1}. {question}
              </label>
              <select
                value={responses[index]}
                onChange={(e) => handleResponseChange(index, e.target.value)}
                required
                className={`w-full px-3 py-2 border rounded-lg ${
                  responses[index] === "Yes" || responses[index] === "No" ? "bg-green-100" : "bg-white"
                }`}
              >
                <option value="">Select an answer</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          ))}
        </div>

        <div className="credentials">
          <label htmlFor="c_origin" className="my-2.5 flex justify-between">
            <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
              <p className="m-auto text-sm text-muted">Certificate of recognition</p>
              <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-body">Browse Files</div>
            </div>
            <input id="c_origin" type="file" onChange={handleFileUpload} className="hidden" />
            <p className="text-xs w-4/12 my-auto ms-3">{selectedFiles?.c_origin}</p>
          </label>

          <label htmlFor="c_prof" className="my-2.5 flex justify-between">
            <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
              <p className="m-auto text-sm text-muted">Professional certificate</p>
              <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-body">Browse Files</div>
            </div>
            <input id="c_prof" type="file" onChange={handleFileUpload} className="hidden" />
            <p className="text-xs w-4/12 my-auto ms-3">{selectedFiles?.c_prof}</p>
          </label>

          <label htmlFor="c_acad" className="my-2.5 flex justify-between">
            <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
              <p className="m-auto text-sm text-muted">Academic certificate</p>
              <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-body">Browse Files</div>
            </div>
            <input id="c_acad" type="file" onChange={handleFileUpload} className="hidden" />
            <p className="text-xs w-4/12 my-auto ms-3">{selectedFiles?.c_acad}</p>
          </label>

          <label htmlFor="others" className="my-2.5 flex justify-between">
            <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
              <p className="m-auto text-sm text-muted">Others</p>
              <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-body">Browse Files</div>
            </div>
            <input id="others" type="file" onChange={handleFileUpload} className="hidden" />
            <p className="text-xs w-4/12 my-auto ms-3">{selectedFiles?.others}</p>
          </label>

          <p className="bg-canvas p-3">As deemed necessary</p>
        </div>

        <Button type="submit" disabled={!isFormComplete || loading} loading={loading} className="w-full">
          Submit
        </Button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.includes("✅") ? "text-green-600" : message.includes("❌") ? "text-danger-600" : "text-yellow-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
