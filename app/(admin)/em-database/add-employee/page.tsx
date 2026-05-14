"use client";

import { useState, useEffect, ReactElement } from "react";
import { useMultistepForm } from "./useMultistep";
import { jwtDecode } from "jwt-decode";

import Formone from "./multistep-form/form_one";
import Formtwo from "./multistep-form/form_two";
import Formthree from "./multistep-form/form_three";

export default function MainForm() {
  const [formdata, setFormdata] = useState({ org: "" });
  const [credentialData, setCredentialData] = useState<Record<string, string>>(
    {}
  );
  const [stepValid, setStepValid] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const [failedEmail, setFailedEmail] = useState('');
  const [failedName, setFailedName] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const decoded = jwtDecode<{ org?: string }>(token);

      if (decoded?.org) {
        setFormdata((prev) => ({
          ...prev,
          org: decoded.org || "",
        }));
      }
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }, []);

  function updateFields(fields: Record<string, any>) {
    setFormdata((prev) => ({ ...prev, ...fields }));
  }

  const steps: ReactElement[] = [
    <Formone
      formdata={formdata}
      updateFields={updateFields}
      setStepValid={setStepValid}
      setCredentialData={setCredentialData}
      selectedFile={selectedFile}
      setSelectedFile={setSelectedFile}
    />,
    <Formtwo
      formdata={formdata}
      updateFields={updateFields}
      setStepValid={setStepValid}
    />,
    <Formthree
      formdata={formdata}
      updateFields={updateFields}
      setStepValid={setStepValid}
    />,
  ];

  const {
    step,
    steps: stepList,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    back,
    next,
  } = useMultistepForm(steps);

  useEffect(() => {
    setStepValid(false);
  }, [currentStepIndex]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isLastStep) return next();

    setAdding(true);

    try {
      const res = await fetch("/api/addEmployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formdata,
          credentialData: Object.values(credentialData),
        }),
      });

      const data = await res.json();

      if (data.status === 200) {
        setIsSuccessful(true);
        setTimeout(() => {
          window.location.href = "/em-database";
        }, 1000);
      } else if (data.status === 201 && data.emailFailed) {
        // User created but email failed — show resend option
        setEmailFailed(true);
        setFailedEmail(data.email);
        setFailedName(data.name);
        setAdding(false);
      } else {
        alert(`error: ${data.message}`);
        setAdding(false);
      }
    } catch (err) {
      console.error(err);
      setAdding(false);
      alert("Something went wrong");
    }
  }

  const isDisabled = (!stepValid && !isLastStep) || adding;

  async function handleResendCredentials() {
    setResending(true);
    try {
      const res = await fetch('/api/resendCredentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: failedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Credentials resent to ${failedEmail} ✅`);
        window.location.href = '/em-database';
      } else {
        alert(`Failed to resend: ${data.message}`);
      }
    } catch (err) {
      alert('Error resending credentials');
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-white m-4">
      {isSuccessful && (
        <div className="bg-white border rounded-lg border-pes flex justify-center align-center shadow-md flex-col p-6 absolute left-1/2 w-fit m-auto">
          <p className="font-bold text-xl text-pes mb-3">
            Employee Added successfully
          </p>
          <p>redirecting...</p>
        </div>
      )}

      {emailFailed && (
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-6 mb-4 flex flex-col gap-3">
          <p className="font-bold text-yellow-800 text-lg">Employee created, but the welcome email failed to send.</p>
          <p className="text-yellow-700 text-sm">
            The account for <strong>{failedName}</strong> ({failedEmail}) was created successfully.
            You can resend their login credentials below.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleResendCredentials}
              disabled={resending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend Credentials'}
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/em-database'; }}
              className="border border-gray-400 text-gray-600 px-6 py-2 rounded hover:bg-gray-50"
            >
              Skip & Go to Employee List
            </button>
          </div>
        </div>
      )}

      <div className="w-full h-[4rem] flex justify-between">
        <h1 className="my-auto mx-6 font-semibold text-xl">
          Add an Employee
        </h1>
      </div>

      <div className="bg-gray-50 h-[3rem] flex justify-between">
        <h1 className="my-auto mx-6 font-semibold">
          Step {currentStepIndex + 1}
        </h1>

        <h1 className="my-auto mx-6 font-semibold">
          {currentStepIndex + 1} / {stepList.length}
        </h1>
      </div>

      {step}

      <div className="w-full my-4 flex justify-between">
        {!isFirstStep && (
          <button
            type="button"
            className="btn rounded-sm py-2 px-8 border mx-8 border-pes text-pes"
            onClick={back}
          >
            Previous
          </button>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className={`btn rounded-sm py-2 px-16 mx-8 border border-pes text-white ms-auto 
            ${
              isDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-pes hover:bg-blue-800"
            }`}
        >
          {adding ? (
            <span className="flex items-center gap-2 justify-center">
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>

              Submitting...
            </span>
          ) : isLastStep ? (
            "Finish"
          ) : (
            "Next"
          )}
        </button>
      </div>
    </form>
  );
}