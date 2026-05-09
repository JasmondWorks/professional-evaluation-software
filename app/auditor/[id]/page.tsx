"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditorQuestions({ params }: { params: { id: string } }) {
  const router = useRouter();
  const email = params.id; // Extracted email
  const [responses, setResponses] = useState<string[]>(Array(13).fill("")); // updated to match 12 questions
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    gsm: "",
    address: "",
    dob: "",
    image: "",
  });

  const [credentialData, setCredentialData] = useState({
    c_origin: '',
    c_prof: '',
    c_acad: '',
    others: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string }>({}); 

  const handleResponseChange = (index: number, value: string) => {
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
      const response = await fetch("/api/auditor-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, responses, ...formData, credentialData: Object.values(credentialData) }),
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

  const questions = [
    "Will you be validating the input data for the current Appraisal and evaluation period?",
    "Will you be validating the entire process based on accountability and fair judgment?",
    "Will your validating of the process be based on Guided Standard which you will make available at the end of the process?",
    "Will exceptions be raised for conflicts detected in the system?",
    "Will your roles as an invited external auditor be independent?",
    "Are you ready to suggest workable frameworks where you deem it fit?",
    "Do you accept that your Management letter at the end of the process be made available globally for use? (After the excercise, ensure to upload the letter of service given to you by the management)",
    "Where awards are applicable for motivation purposes as suggested by the system software, will you validate to ensure that there isn’t marginalization or nepotism?",
    "Are you welcome to open criticism?",
    "Will you be executing on proxy this exercise you are called on to do?",
    "Will this exercise you are called on to do be done remotely?",
    "If invited again in the future, will you accept the invitation even if you were openly criticized?",
    "Do you want your role to be recognized globally by this app?",
  ];

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
        console.log(err);
        // console.log(err);
      }
    }

  return (
    <div className="max-w-3xl mx-auto h-fit overflow-scroll mt-10 p-6 rounded-2xl shadow-md bg-white text-pes">
      <h1 className="text-2xl font-semibold mb-6">Auditor Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>

          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            type="text"
            placeholder="GSM (Plus country code)"
            value={formData.gsm}
            onChange={(e) => handleFormChange("gsm", e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            type="text"
            placeholder="Office Address"
            value={formData.address}
            onChange={(e) => handleFormChange("address", e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <label htmlFor="dob" className="mt-2">
            <span className="text-gray-400 mt-2 m-1">Date of birth</span>
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

          {questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <label className="block font-medium">
                {index + 1}. {question}
              </label>
                <select
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
            <label htmlFor="c_origin" className="my-2.5 flex justify-between">
              <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
                <p className="m-auto text-sm text-gray-500">Certificate of recognition</p>
                <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-gray-600">Browse Files</div>
              </div>
              <input id="c_origin" type="file" onChange={handleFileUpload} className="hidden" />
              <p className="text-xs w-4/12 my-auto ms-3">{ selectedFiles?.c_origin }</p>
            </label>

            <label htmlFor="c_prof" className="my-2.5 flex justify-between">
              <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
                <p className="m-auto text-sm text-gray-500">Professional certificate</p>
                <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-gray-600">Browse Files</div>
              </div>
              <input id="c_prof" type="file" onChange={handleFileUpload} className="hidden" />
              <p className="text-xs w-4/12 my-auto ms-3">{ selectedFiles?.c_prof }</p>
            </label>

            <label htmlFor="c_acad" className="my-2.5 flex justify-between">
              <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
                <p className="m-auto text-sm text-gray-500">Academic certificate</p>
                <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-gray-600">Browse Files</div>
              </div>
              <input id="c_acad" type="file" onChange={handleFileUpload} className="hidden" />
              <p className="text-xs w-4/12 my-auto ms-3">{ selectedFiles?.c_acad }</p>
            </label>

            <label htmlFor="others" className="my-2.5 flex justify-between">
              <div className="flex justify-end bg-white rounded-sm w-8/12 my-2.5 border relative cursor-pointer">
                <p className="m-auto text-sm text-gray-500">Others</p>
                <div className="bg-gray-200 hover:bg-pes hover:text-white rounded-sm px-5 py-3 text-sm text-gray-600">Browse Files</div>
              </div>
              <input id="others" type="file" onChange={handleFileUpload} className="hidden" />
              <p className="text-xs w-4/12 my-auto ms-3">{ selectedFiles?.others }</p>
            </label>

            <p className="bg-gray-50 p-3">As deemed necessary</p>
        </div>

        <button
          type="submit"
          disabled={!isFormComplete || loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition ${
            isFormComplete
              ? "bg-pes hover:opacity-90 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-60"
          }`}
        >
          {
            loading? "Loading..." : "Submit"
          }
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            message.includes("✅")
              ? "text-green-600"
              : message.includes("❌")
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
