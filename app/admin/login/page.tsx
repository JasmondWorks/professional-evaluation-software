"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/useAuth";
import { getAccessToken } from "@/app/utils/auth";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

type formdata = {
  email: string;
  password: string;
};

export default function Home() {
  const { setRole } = useAuth();
  const [message, setMessage] = useState({
    visibility: "invisible",
    text: "",
    color: "",
  });
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
    setMessage({ visibility: "visible", text: "loading", color: "green" });

    try {
      const req = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let res = await req.json();

      if (res.status == 200) {
        localStorage.setItem("access_token", res.token);

        setRole(res.role);

        document.cookie = `role=${res.role}; path=/; max-age=86400`;

        // The platform console for super-admin now lives in the main app's own
        // dashboard, not this legacy shell — same token, same auth, different UI.
        router.push(res.role === "super-admin" ? "/dashboard" : "/admin/dashboard");
      } else if (res.status == 500) {
        setMessage({
          visibility: "visible",
          text: "login failed, check details",
          color: "red",
        });
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    if (getAccessToken()) {
      const role = document.cookie.match(/(?:^|; )role=([^;]+)/)?.[1];
      router.push(role === "super-admin" ? "/dashboard" : "/admin/dashboard");
    }
  }, [router]);

  return (
    <main className="w-full flex overflow-hidden relative">
      {/* message box */}
      <div
        style={{ borderColor: message.color }}
        className={`z-10 bg-white absolute p-6 px-12 shadow-md rounded-md border text-body font-semibold ${message.visibility} top-3 left-1/2 -translate-x-1/2`}
      >
        {message.text}
      </div>

      {/* illustration */}
      <div className="illustration bg-pes-gradient w-1/2 h-screen relative flex">
        <Image
          src={"/pes.svg"}
          alt="pes hero image"
          width={130}
          height={130}
          className="z-10 mx-auto my-auto"
        />
      </div>

      {/* login form */}
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={schema}
        onSubmit={(values) => login("/api/admin/login", values)}
      >
        {({ isValid, dirty }) => (
          <Form className="form w-1/2 h-screen flex flex-col p-28 justify-center">
            <p className="text-4xl text-semibold mb-8">Sign In(admin)</p>

            <div className="mb-4">
              <Field
                as={Input}
                label="Email Address"
                type="email"
                name="email"
                id="email"
                required
              />
            </div>

            <div className="mb-4">
              <Field
                as={Input}
                label="Password"
                type="password"
                name="password"
                id="password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mb-2"
              disabled={!(dirty && isValid)}
            >
              Sign In
            </Button>
          </Form>
        )}
      </Formik>
    </main>
  );
}
