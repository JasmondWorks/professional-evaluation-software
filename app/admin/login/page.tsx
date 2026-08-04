"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/useAuth";
import { getAccessToken } from "@/app/utils/auth";
import { Eye } from "iconsax-react";
import { EyeOff } from "lucide-react";

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

        router.push("/admin/dashboard");
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
      router.push("/admin/dashboard");
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

            <div className="input flex flex-col justify-center mb-4">
              <label htmlFor="email" className="mb-1">
                Email Address:
              </label>
              <Field
                className="bg-transparent border border-line text-body focus:outline-pes ps-4 py-2 rounded-lg"
                type="email"
                name="email"
                id="email"
                required
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
                  required
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

            <button
              type="submit"
              className="btn bg-pes text-white px-4 py-3 flex justify-center rounded-lg mb-2 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!(dirty && isValid)}
            >
              Sign In
            </button>
          </Form>
        )}
      </Formik>
    </main>
  );
}
