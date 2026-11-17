"use client";

import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from '@/app/utils/apiFetch';
import { Badge, Button, Input, Label } from '@/app/components/ui';
import { AUDITOR_QUESTIONS, CREDENTIAL_SLOTS } from '@/app/lib/auditor/questions';

type AuditorStatus = {
  submitted: boolean;
  status?: string | null;
  rejectionReason?: string | null;
  recognitionConsent?: boolean;
};

export default function AuditorQuestions({ params }: { params: { id: string } }) {
  const router = useRouter();
  const token = params.id; // Extracted token
  const [email, setEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState("");
  const [existing, setExisting] = useState<AuditorStatus | null>(null);

  const [responses, setResponses] = useState<string[]>(
    Array(AUDITOR_QUESTIONS.length).fill(""),
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    gsm: "",
    address: "",
    dob: "",
    image: "",
  });

  const [credentialData, setCredentialData] = useState<Record<string, string>>({})
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string }>({}); 

  const handleResponseChange = (index: number, value: string) => {
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await apiFetch("/api/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        
        if (response.ok) {
          setEmail(data.email);

          // Already submitted? Show their status instead of the form —
          // there's no pesuser/session yet to gate a dedicated page behind,
          // so this reuses the same invite-link token.
          const statusRes = await apiFetch("/api/auditor-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const statusData = await statusRes.json();
          if (statusRes.ok && statusData.submitted) {
            setExisting(statusData);
          }
        } else {
          setVerificationError(data.message || "Invalid token");
        }
      } catch (error) {
        setVerificationError("Failed to verify token");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // ✅ check all required fields are filled
  const isFormComplete =
    formData.name.trim() !== "" &&
    formData.gsm.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.dob.trim() !== "" &&
    responses.every((r) => r.trim() !== "" &&
    Object.keys(selectedFiles).length >= 3
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    try {
      const response = await apiFetch("/api/auditor-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `credentials` is sent as a slot -> URL map. It used to go as
        // Object.values(), which threw away which certificate each URL was.
        // `token` is what the route derives the email and inviting org from;
        // neither is trusted from this body.
        body: JSON.stringify({
          ...formData,
          responses,
          credentials: credentialData,
          token,
        }),
      });

      if (response.ok) {
        setMessage("✅ Submitted successfully! Awaiting admin approval.");
        setLoading(false)
        router.push("/thank-you");
      } else {
        setMessage("❌ Failed to submit.");
      }
    } catch (error) {
      setMessage("⚠️ An error occurred while submitting.");
    }
  };


    async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      const labelName = e.target.id;

      if (!file) return;

      setSelectedFiles(prev => ({
        ...prev,
        [labelName]: file.name
      }));
  
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "pes_unsigned");
      data.append("folder", `pes/${email}/credentials/${labelName}`);
      // data.append("public_id", labelName); // use label name as filename
      // data.append("unique_filename", "false");
      // data.append("overwrite", "true");
  
      try {
        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/duvqe45ds/image/upload",
          {
            method: "POST",
            body: data
          }
        );
        const uploaded = await cloudRes.json();

        setCredentialData(prev => ({
          ...prev,
          [labelName]:uploaded.secure_url          
        }));

      } catch (err) {
        // console.log(err);
        }
    }

  if (isVerifying) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 rounded-2xl shadow-md bg-white text-pes text-center">
        <p className="text-xl font-medium animate-pulse">Verifying invitation...</p>
      </div>
    );
  }

  if (verificationError || !email) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-10 rounded-2xl shadow-md bg-white text-pes text-center space-y-4">
        <div className="text-danger-600 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-semibold text-danger-600">Access Denied</h1>
        <p className="text-body font-medium">{verificationError || "Invalid or Expired Invitation Link"}</p>
        <p className="text-sm text-muted mt-4">Please contact the administrator to request a new invitation.</p>
      </div>
    );
  }

  if (existing) {
    const tone =
      existing.status === "approved" ? "success" : existing.status === "rejected" ? "danger" : "warning";
    const label =
      existing.status === "approved" ? "Approved" : existing.status === "rejected" ? "Rejected" : "In Review";

    return (
      <div className="max-w-3xl mx-auto mt-10 p-10 rounded-2xl shadow-md bg-white text-pes text-center space-y-4">
        <h1 className="text-2xl font-semibold">Your Application Status</h1>
        <Badge tone={tone} className="text-sm px-4 py-1">{label}</Badge>
        {existing.status === "rejected" && existing.rejectionReason && (
          <p className="text-sm text-muted mt-4">
            <span className="font-medium text-body">Reason: </span>
            {existing.rejectionReason}
          </p>
        )}
        {existing.status !== "rejected" && (
          <p className="text-sm text-muted mt-4">
            You&apos;ll be notified by email once the platform admin has reviewed your submission.
          </p>
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
            label="Full name"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            required
          />

          <Input
            type="text"
            label="GSM"
            placeholder="GSM (Plus country code)"
            value={formData.gsm}
            onChange={(e) => handleFormChange("gsm", e.target.value)}
            required
          />

          <Input
            type="text"
            label="Office address"
            placeholder="Office Address"
            value={formData.address}
            onChange={(e) => handleFormChange("address", e.target.value)}
            required
          />

          {/* type="date" is excluded from this sweep per instructions (dedicated
              date component territory); left as a raw input. */}
          <div className="mt-2 flex flex-col gap-1.5">
            <Label htmlFor="dob">Date of birth</Label>
            <input
              type="date"
              id="dob"
              placeholder="Date of Birth"
              value={formData.dob}
              onChange={(e) => handleFormChange("dob", e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

        </div>

        {/* Yes/No Questions */}
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold">Auditor's Questionnaire</h2>

          {AUDITOR_QUESTIONS.map((question, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`question-${index}`} className="block font-medium">
                {index + 1}. {question}
              </Label>
                <select
                  id={`question-${index}`}
                  value={responses[index]}
                  onChange={(e) => handleResponseChange(index, e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg ${
                    (responses[index] === "Yes" || responses[index] === "No") ? "bg-green-100" :
                    "bg-white"
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
            <h2 className="text-lg font-semibold mb-2">Credentials</h2>

            {/* One block per slot in CREDENTIAL_SLOTS — the four were copy-pasted,
                so the input id, its label and the key the URL is stored under
                had to be kept in sync by hand in three places each. */}
            {CREDENTIAL_SLOTS.map(({ key, label }) => (
              <div key={key} className="my-2.5 flex justify-between">
                <Label
                  htmlFor={key}
                  className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer font-normal"
                >
                  <span className="m-auto text-sm text-muted">{label}</span>
                  <span className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-body">
                    Browse Files
                  </span>
                </Label>
                <input id={key} type="file" onChange={handleFileUpload} className="hidden" />
                <p className="text-xs w-4/12 my-auto ms-3">{selectedFiles?.[key]}</p>
              </div>
            ))}

            <p className="bg-canvas p-3">As deemed necessary</p>
        </div>

        <Button
          type="submit"
          disabled={!isFormComplete || loading}
          loading={loading}
          className="w-full"
        >
          Submit
        </Button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.includes("✅")
              ? "text-green-600"
              : message.includes("❌")
              ? "text-danger-600"
              : "text-yellow-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
