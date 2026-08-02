"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/useAuth";
import { notify } from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";
import { getAccessToken, setAccessToken } from '@/app/utils/auth';

type formdata = {
  email: string;
  password: string;
  remember?: boolean;
};

export default function Home() {
  const { setRole } = useAuth();
  // Inline error state for the specific network/server error message.
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const schema = Yup.object({
    email: Yup.string()
      .email("Invalid email address format")
      .required("Email is required"),

    password: Yup.string()
      .min(3, "Password must be 3 characters at minimum")
      .required("Password is required"),
  });

  async function login(url: string, data: formdata) {
    setErrorMessage("");
    const toastId = notify.loading("Signing in…");

    try {
      const req = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let res = await req.json();

      if (res.status == 200) {
        setAccessToken(res.token);

        setRole(res.role);

        if (data.remember) {
          // 30 days max-age
          document.cookie = `role=${res.role}; path=/; max-age=2592000`;
        } else {
          // Session cookie (cleared on browser close)
          document.cookie = `role=${res.role}; path=/`;
        }

        notify.dismiss(toastId);
        notify.success("Signed in successfully");
        
        // Delay the redirect slightly to ensure the browser's native password 
        // manager has time to catch the successful form submission and prompt the user.
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      } else {
        const errorText =
          res.status >= 500
            ? "Sorry! Something went wrong on our end, please try again later"
            : res.message || "Login failed, invalid details";

        setErrorMessage(errorText);
        notify.dismiss(toastId);
        notify.error(errorText);
      }
    } catch (error) {
      const errorText =
        "Unable to reach the server. Please check your connection and try again.";
      setErrorMessage(errorText);
      notify.dismiss(toastId);
      notify.error(errorText);
    }
  }

  useEffect(() => {
    if (getAccessToken()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <Formik
      initialValues={{ email: "", password: "", remember: false }}
      validationSchema={schema}
      onSubmit={(values) => {
        login("/api/login", values);
      }}
    >
      {({ isValid, dirty }) => (
        <Form className="form w-full flex flex-col">
            <p className="text-4xl text-semibold mb-8">Sign In</p>

            {errorMessage && (
              <div
                role="alert"
                className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <div className="input flex flex-col justify-center mb-4">
              <label htmlFor="email" className="mb-1">
                Email Address:
              </label>
              <Field
                className="bg-transparent border border-line text-body focus:outline-pes ps-4 py-2 rounded-lg"
                type="email"
                name="email"
                id="email"
                autoComplete="username"
                required
                tabIndex={1}
              />
            </div>

            <div className="input flex flex-col justify-center mb-4">
              <label htmlFor="password" className="mb-1">
                Password:
              </label>
              <div className="relative w-full">
                <Field
                  className="bg-transparent border border-line text-body focus:outline-pes ps-4 py-2 rounded-lg w-full pr-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  tabIndex={2}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex flex-row justify-between mb-8">
              <div className="flex">
                <Field
                  type="checkbox"
                  name="remember"
                  id="remember"
                  tabIndex={3}
                />
                <label htmlFor="remember" className="mx-2">
                  Remember me
                </label>
              </div>

              <Link className="text-pes" href={"/forgot-password"} tabIndex={5}>
                Forgot Password ?
              </Link>
            </div>

            <button
              type="submit"
              className="btn bg-pes text-white px-4 py-3 flex justify-center rounded-lg mb-2 
                         disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-900 transition-colors"
              disabled={!(dirty && isValid)}
              tabIndex={4}
            >
              Sign In
            </button>
            <p className="text-center">
              {`Don't have an Account?`}{" "}
              <Link className="text-pes" href={"/signup"}>
                Sign Up
              </Link>{" "}
            </p>
        </Form>
      )}
    </Formik>
  );
}
