"use client";
import { ArrowRight, Category } from "iconsax-react";
import { FormEvent, useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/toast";

const slides = [
  {
    titleElement: (
      <h1 className="text-3xl text-semibold my-2 w-10/12">
        {`Your Company's journey`} <br /> {`towards`}{" "}
        <span className="text-yellow-400">
          Enhanced <br /> Performance
        </span>{" "}
        {`starts today`}
      </h1>
    ),
    paragraph:
      "PES is your company's tool for optimizing team performance. Discover a suite of tools tailored to enhance collaboration and achieve organizational goals",
  },
  {
    titleElement: (
      <h1 className="text-3xl text-semibold my-2 w-10/12">
        Customize You Metrics
      </h1>
    ),
    paragraph:
      "Craft performance metrics that align with your company's objectives. Our intuitive interface allows you to define goals that resonate with your team's roles and aspirations.",
  },
];

const PLAN_CODES = {
  basic: "PLN_eowlq7d4cp4r0dp",
  standard: "PLN_cle5ip7jtxfpj5k",
  premium: "PLN_paglu0ly0z641mm",
};

type PlanType = keyof typeof PLAN_CODES;

// Utility for safely resolving plan codes
const resolvePlanCode = (plan: string) =>
  PLAN_CODES[plan as PlanType] ?? PLAN_CODES.basic;

export default function Home() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productCategory = searchParams.get("product_category") as string;
  const planType = searchParams.get("product_plan") as string;

  console.log(planType, productCategory);
  // --- React state ---
  // Inline error state for the specific network/server error message.
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    org: "",
    email: "",
    password: "",
    confirmPassword: "", // Added for proper binding
    category: productCategory, // Will update in useEffect
    plan: planType, // Will update in useEffect
    planCode: "", // Will update in useEffect
    logo: "",
    agree: false, // Added for proper binding
  });

  // Sync params to state when they become available
  useEffect(() => {
    if (productCategory && planType) {
      setFormData((prev) => ({
        ...prev,
        category: productCategory,
        plan: planType,
        planCode: resolvePlanCode(planType),
      }));
    } else {
      // Optional: Redirect if params are strictly required
      // router.replace("/forbidden");
    }
  }, [productCategory, planType]);

  const allFieldsFilled =
    formData.name.trim() !== "" &&
    formData.org.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    // formData.logo?.trim() !== '' &&
    // formData.logo?.trim() !== ''&&
    formData.confirmPassword.trim() !== "" &&
    formData.agree === true;

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "pes_unsigned"); // change this to env if needed
    data.append("folder", "pes/logo");

    try {
      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/duvqe45ds/image/upload",
        {
          method: "POST",
          body: data,
        },
      );
      const uploaded = await cloudRes.json();

      setFormData((prev) => ({
        ...prev,
        logo: uploaded.secure_url,
      }));
    } catch (err) {
      console.log(err);
    }
  }

  const switchSlide = () => {
    setActiveSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  // Improved handleChange to handle checkboxes and standard inputs
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    // Pre-validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      notify.error("Passwords do not match");
      return;
    }

    const toastId = notify.loading("Signing up, please wait…");

    try {
      const req = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check HTTP status code
      if (!req.ok) {
        const errorData = await req.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Error: ${req.status} ${req.statusText}`;
        throw new Error(errorMessage);
      }

      const res = await req.json();

      console.log("token before storage:", res.token);
      localStorage.setItem("access_token", res.token);
      notify.dismiss(toastId);
      notify.success("Account created successfully");
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      let errorMsg = "An unexpected error occurred";
      if (error instanceof Error) {
        if (
          error.message.includes("already exists") ||
          error.message.includes("unique constraint")
        ) {
          errorMsg = "This email is already registered.";
        } else {
          errorMsg = error.message;
        }
      }
      setErrorMessage(errorMsg);
      notify.dismiss(toastId);
      notify.error(errorMsg);
    }
  }

  return (
    <main className="w-full flex flex-col md:flex-row min-h-screen">
      <div className="illustration2 bg-white w-full md:w-1/2 py-10 px-8 md:px-28">
        <div className="my-2 text-pes text-3xl font-extrabold flex">
          <Image src={"/Vector.svg"} alt="PES" width={55} height={55} />
          <p className="ms-2 my-auto">PES</p>
        </div>

        <div className="carousel w-full text-left mt-10">
          {slides.map(
            (slide, key) =>
              activeSlideIndex === key && (
                <div key={key} className="animate-in fade-in duration-500">
                  {slide.titleElement}
                  <p className="text-sm mt-4">{slide.paragraph}</p>
                </div>
              ),
          )}
        </div>

        <div className="overflow-hidden mx-auto mt-10">
          {slides.map(
            (_, key) =>
              activeSlideIndex === key && (
                <Image
                  key={key}
                  src={`/image${key + 1}.png`}
                  width={320}
                  height={320}
                  alt={`slide${key + 1}`}
                  className="carousel-image object-cover animate-in fade-in duration-500"
                />
              ),
          )}
        </div>

        <div className="scroller w-full flex justify-between items-center mt-12">
          <div className="page my-auto flex">
            {slides.map((_, key) => (
              <div
                key={key}
                className={`ircle h-2 ${activeSlideIndex === key ? "w-6 bg-pes" : "w-2 bg-gray-200"} rounded-full mx-1 transition-all`}
              ></div>
            ))}
          </div>

          <div
            className="slider bg-pes p-3 rounded-full text-white cursor-pointer"
            onClick={() => switchSlide()}
          >
            <ArrowRight />
          </div>
        </div>
      </div>

      <form
        onSubmit={signup}
        className="form w-full md:w-1/2 py-14 px-8 md:px-28"
      >
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <p className="text-3xl text-extrabold">Create your Account</p>
        <p className="text-sm mb-8">{`Enter your details and let's get started`}</p>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="name" className="mb-1 font-bold text-sm">
            Admin Name:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.name}
            className="bg-transparent border border-gray-200 text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            type="text"
            name="name"
            id="name"
            placeholder="Enter your Institution or company name"
          />
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="org" className="mb-1 font-bold text-sm">
            Organization Name:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.org}
            className="bg-transparent border border-gray-200 text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            type="text"
            name="org"
            id="org"
            placeholder="Enter your Institution or company name"
          />
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="email" className="mb-1 font-bold text-sm">
            Email Address:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.email}
            className="bg-transparent border border-gray-200 text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your Institution or company email"
          />
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="password" className="mb-1 font-bold text-sm">
            Password:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.password}
            className="bg-transparent border border-gray-200 text-gray-700 placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            type="password"
            name="password"
            id="password"
            placeholder="Enter your Password"
          />
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="confirmPassword" className="mb-1 font-bold text-sm">
            Confirm Password:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.confirmPassword}
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            className="bg-transparent border border-gray-200 text-gray-700 placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            placeholder="Confirm your Password"
          />
        </div>

        <div className="flex flex-row justify-start mb-8">
          <div className="flex">
            <input
              required
              onChange={handleChange}
              type="checkbox"
              name="agree"
              id="agree"
            />
            <label htmlFor="agree" className="mx-4 text-sm">
              I accept all{" "}
              <span className="font-bold">terms and conditions</span>
            </label>
          </div>
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="logo" className="mb-1 font-bold text-sm">
            Institution Logo:
          </label>
          <input
            required
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-400"
          />

          {formData.logo && (
            <Image
              src={formData.logo}
              alt="Logo preview"
              width={80}
              height={80}
              className="mt-3 rounded-md border border-gray-300"
            />
          )}
        </div>

        <p
          className={`text-sm mb-4 ${allFieldsFilled ? "text-green-700" : "text-red-700"}`}
        >
          *All fields are required to proceed.
        </p>
        <input
          disabled={!allFieldsFilled}
          type="submit"
          value={"Sign up"}
          className={`w-full btn px-4 py-3 rounded-lg mb-2 text-white
            ${allFieldsFilled ? "bg-pes hover:bg-[#141444] cursor-pointer" : "bg-gray-400 cursor-not-allowed"}
          `}
        />

        {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
        <p className="text-center">
          {`Have an Account?`}{" "}
          <Link className="text-pes" href={"/login"}>
            Sign In
          </Link>{" "}
        </p>
      </form>
    </main>
  );
}
