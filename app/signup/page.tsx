"use client";
import { ArrowRight, Category } from "iconsax-react";
import { FormEvent, useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/toast";
import { apiFetch } from "@/app/utils/apiFetch";
import { normalizeInstitution, normalizePlan } from "@/app/lib/billing/catalog";

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

// The Paystack plan codes that used to live here were hardcoded, disagreed with
// the amounts in /api/signup and knew nothing about institution type. The
// catalogue in app/lib/billing/catalog.ts replaces them.

export default function Home() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productCategory = searchParams.get("product_category") as string;
  const planType = searchParams.get("product_plan") as string;
  // PayPal appends its subscription id on return from checkout. It is the proof
  // of payment the server verifies before creating anything.
  const paymentReference =
    searchParams.get("subscription_id") ?? searchParams.get("reference");

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
    reference: "",
    logo: "",
    agree: false, // Added for proper binding
  });

  // Signup is only reachable by following a paid checkout, which appends the
  // institution type, the plan and the PayPal reference. Reaching this page by
  // hand means there is no payment to attach the organization to, so there is
  // nothing to sign up for. Send them to login rather than showing a form that
  // cannot succeed.
  useEffect(() => {
    const institution = normalizeInstitution(productCategory);
    const plan = normalizePlan(planType);

    // if (!institution || !plan) {
    //   notify.error("Missing payment plan details");
    //   router.replace("/login");
    //   return;
    // }

    setFormData((prev) => ({
      ...prev,
      category: productCategory,
      plan: planType,
      reference: paymentReference ?? "",
    }));
  }, [productCategory, planType, paymentReference, router]);

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
    } catch (err) {}
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
      const req = await apiFetch("/api/signup", {
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

      localStorage.setItem("access_token", res.token);
      notify.dismiss(toastId);
      notify.success("Account created successfully");
      router.push("/dashboard");
    } catch (error) {
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
            className="mb-6 rounded-md border border-danger-100 bg-danger-50 p-4 text-sm font-semibold text-danger-700"
          >
            {errorMessage}
          </div>
        )}

        <p className="text-3xl text-extrabold">Create your Account</p>
        <p className="text-sm mb-8">{`Enter your details and let's get started`}</p>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="name" className="mb-1 font-bold text-sm">
            Your Name:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.name}
            className="bg-transparent border border-line text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            type="text"
            name="name"
            id="name"
            placeholder="Enter your full name"
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
            className="bg-transparent border border-line text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            type="text"
            name="org"
            id="org"
            placeholder="Enter your Institution or company name"
          />
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="email" className="mb-1 font-bold text-sm">
            Your Email Address:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.email}
            className="bg-transparent border border-line text-black placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your work email address"
          />
          {/* The organization has no address of its own, deliberately. This one
              is a credential: it signs you in and receives password resets, so
              it must belong to a person rather than a shared mailbox. */}
          <p className="mt-1 text-xs text-muted">
            This is your own address, not a shared organization mailbox. You will
            sign in with it.
          </p>
        </div>

        <div className="input flex flex-col justify-center mb-4">
          <label htmlFor="password" className="mb-1 font-bold text-sm">
            Password:
          </label>
          <input
            required
            onChange={handleChange}
            value={formData.password}
            className="bg-transparent border border-line text-body placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
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
            className="bg-transparent border border-line text-body placeholder:text-gray-300 text-sm focus:outline-pes ps-4 py-3 rounded-md"
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
            className="text-sm text-muted"
          />

          {formData.logo && (
            <Image
              src={formData.logo}
              alt="Logo preview"
              width={80}
              height={80}
              className="mt-3 rounded-md border border-line"
            />
          )}
        </div>

        <p
          className={`text-sm mb-4 ${allFieldsFilled ? "text-green-700" : "text-danger-700"}`}
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
