"use client";

import { useState, useEffect } from "react";
import { useMultistepForm } from "./useMultistep";
import { jwtDecode } from "jwt-decode";

import Formone from "./multistep-form/form_one";
import Formtwo from "./multistep-form/form_two";
import Formthree from "./multistep-form/form_three";

export default function MainForm() {
  const [formdata, setFormdata] = useState({org: ''});
  const [credentialData, setCredentialData] = useState<{[key: string]: string}>({})
  const [stepValid, setStepValid] = useState(false); // 🔥 key addition
  const [adding, setAdding] = useState(false)
  const [selectedFile, setSelectedFile] = useState("");
  const [isSuccessful, setIsSuccessful] =  useState(false)

    useEffect(() => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const decoded: any = jwtDecode(token);

        // adjust key name to match your JWT payload
        if (decoded?.org) {
          setFormdata(prev => ({
            ...prev,
            org: decoded.org
          }));
        }

      } catch (err) {
        console.error("Invalid token:", err);
      }
    }, []);

  function updateFields(fields) {
    setFormdata(prev => ({ ...prev, ...fields }));
  }

  const steps = [
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
    next
  } = useMultistepForm(steps);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isLastStep) return next();

    setAdding(true);

    try {
      const res = await fetch("/api/addEmployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formdata,
          credentialData: Object.values(credentialData)
        })
      });

      const data = await res.json();

      if (data.status === 200) {
        // alert("Employee added successfully");
        setIsSuccessful(true)
        setTimeout(()=>{
          window.location.href = "/em-database";
        }, 1000)

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-white m-4">
      {
        isSuccessful&&
        <div className="bg-white border rounded-lg border-pes flex justify-center align-center shadow-md flex-col p-6 absolute left-1/2 w-fit m-auto">
          <p className="font-bold text-xl text-pes mb-3">Employee Added successfully</p>
          <p>redirecting...</p>
        </div>
      }

      <div className="w-full h-[4rem] flex justify-between">
        <h1 className="my-auto mx-6 font-semibold text-xl">Add an Employee</h1>
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
          disabled={!stepValid || adding}
          className={`btn rounded-sm py-2 px-16 mx-8 border border-pes text-white ms-auto 
            ${
              stepValid && !adding
                ? "bg-pes hover:bg-blue-800"
                : "bg-gray-400 cursor-not-allowed"
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
