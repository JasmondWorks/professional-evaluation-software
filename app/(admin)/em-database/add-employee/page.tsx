"use client";

import { useState, useEffect, ReactElement } from "react";
import { useMultistepForm } from "./useMultistep";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { notify } from "@/lib/toast";

import Formone from "./multistep-form/form_one";
import Formtwo from "./multistep-form/form_two";
import Formthree from "./multistep-form/form_three";
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { ArrowLeft } from "iconsax-react";
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";
import { Progress } from "@/app/components/ui/progress";
import { Alert } from "@/app/components/ui/alert";
import { Modal } from "@/app/components/ui/modal";

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
    const token = getAccessToken();
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isLastStep) return next();

    setAdding(true);

    try {
      const res = await apiFetch("/api/addEmployee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          ...formdata,
          credentialData: Object.values(credentialData),
        }),
      });

      const data = await res.json();

      if (data.status === 200) {
        notify.success("Employee added and credentials emailed.");
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
        notify.error(data.message || "Could not add employee.");
        setAdding(false);
      }
    } catch (err) {
      console.error(err);
      setAdding(false);
      notify.error("Something went wrong. Please try again.");
    }
  }

  const isDisabled = (!stepValid && !isLastStep) || adding;

  async function handleResendCredentials() {
    setResending(true);
    try {
      const res = await apiFetch('/api/resendCredentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: failedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        notify.success(`Credentials resent to ${failedEmail}`);
        window.location.href = '/em-database';
      } else {
        notify.error(`Failed to resend: ${data.message}`);
      }
    } catch (err) {
      notify.error('Error resending credentials');
    } finally {
      setResending(false);
    }
  }

  const totalSteps = stepList.length;
  const pct = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/em-database" className="inline-flex items-center gap-1.5 w-fit text-sm font-medium text-muted hover:text-pes transition-colors mb-4 group">
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
        Back to database
      </Link>

      <PageHeader
        title="Add an employee"
        subtitle={`Step ${currentStepIndex + 1} of ${totalSteps}`}
      />

      {emailFailed && (
        <Alert
          tone="warning"
          title="Employee created, but the welcome email failed to send."
          className="mb-5"
        >
          <p className="mb-3">
            The account for <strong>{failedName}</strong> ({failedEmail}) was created
            successfully. You can resend their login credentials below.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleResendCredentials} loading={resending} disabled={resending}>
              Resend credentials
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { window.location.href = '/em-database'; }}>
              Skip &amp; go to employee list
            </Button>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl shadow-card p-5 sm:p-6">
        <Progress value={pct} className="mb-6" />

        {step}

        <div className="mt-6 flex items-center justify-between gap-3">
          {!isFirstStep ? (
            <Button type="button" variant="secondary" onClick={back}>
              Previous
            </Button>
          ) : <span />}

          <Button type="submit" disabled={isDisabled} loading={adding}>
            {adding ? "Submitting" : isLastStep ? "Finish" : "Next"}
          </Button>
        </div>
      </form>

      {/* Success confirmation */}
      <Modal isOpen={isSuccessful} setIsOpen={() => {}} showClose={false} title="Employee added successfully">
        <p className="text-sm text-muted">Redirecting to the employee list…</p>
      </Modal>
    </div>
  );
}