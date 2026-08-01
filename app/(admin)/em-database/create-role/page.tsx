"use client";

import { ArrowLeft } from "iconsax-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import { PRESET_ROLES, PRESET_ROLE_LABELS } from "@/app/components/utils/roles";
import PermissionSelector from "@/app/components/ui/PermissionSelector";
import { apiFetch } from '@/app/utils/apiFetch';

export default function CreateRole() {
  // base_role defaults to the baseline preset so the role is always mappable.
  const [formData, setFormData] = useState<Record<string, any>>({
    base_role: "employee-w",
  });
  const router = useRouter();

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const target = event.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? target.checked : value,
    });
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const access_token = getAccessToken() as string;
    const user = jwt.decode(access_token);
    console.log("data is: ", formData);

    // Safely extract 'org' from user if possible
    const orgName =
      typeof user === "object" && user !== null && "org" in user
        ? (user as { org: string }).org
        : "";

    try {
      const req = apiFetch("/api/addRoles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, org: orgName }),
      });

      const res = await (await req).json();
      if (res.status == 200) {
        toast.success("Role Created Successfully!");
      } else {
        toast.error("Failed to create role");
      }
      router.push("/em-database");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="bg-white m-4">
      <div className="(crt-nav) w-full h-[4rem] flex justify-between">
        <h1 className="my-auto mx-6 font-semibold text-xl text-gray-600">
          Create a role
        </h1>
        <Link
          href="/em-database"
          className="my-auto mx-6 text-blue-800 text-sm flex"
        >
          <ArrowLeft size={20} className="my-auto mx-1" />
          Back to Roles & Permissions
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex border">
          <div className="border-r w-1/2">
            <div className="bg-gray-50 border-b h-[3rem] flex">
              <h1 className="my-auto mx-4 font-semibold">Role Details</h1>
            </div>
            <div className=" placeholder-slate-200 m-4">
              <label htmlFor="role_name" className="flex flex-col mb-4">
                Role Name:
                <input
                  onChange={handleChange}
                  name="role_name"
                  type="text"
                  className="border outline-1 outline-gray-200 rounded-[0.25rem] mt-1 font-medium text-gray-800 placeholder:font-thin placeholder:text-gray-400 px-4 py-2 pb-4"
                  id="name"
                  placeholder="Enter a name that represents the role's responsibilities and purpose."
                />
              </label>
              <label htmlFor="description" className="flex flex-col mb-4">
                Role Description:
                <input
                  onChange={handleChange}
                  name="description"
                  type="text"
                  className="border outline-1 outline-gray-200 rounded-[0.25rem] mt-1 font-medium text-gray-800 placeholder:font-thin placeholder:text-gray-400 px-4 py-2 pb-16"
                  id="description"
                  placeholder="Provide a brief description outlining the role's key responsibilities and purpose."
                />
              </label>
            </div>
          </div>
          <div className="w-1/2">
            <div className="bg-gray-50 border-b h-[3rem] flex">
              <h1 className="my-auto mx-4 font-semibold">Permissions</h1>
            </div>
            <div className=" placeholder-slate-300">
              <div className="border-b p-4">
                <p>
                  Here, you can set permissions for the selected role. Define
                  what access and actions this role can perform within the
                  platform.
                </p>
              </div>

              <PermissionSelector
                value={formData}
                onChange={(patch) =>
                  setFormData((prev) => ({ ...prev, ...patch }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="border-r w-1/2 me-auto">
            <div className="bg-gray-50 border-b h-[3rem] flex">
              <h1 className="my-auto mx-4 font-semibold">Behaves Like</h1>
            </div>
            <div className="m-4">
              <p>{`Choose which system role this custom role behaves as. Employees given this role will see that preset's screens and navigation, while still showing this role's name and using the permissions above.`}</p>
              <label htmlFor="base_role" className="flex my-8">
                <span className="my-auto">Base role:</span>
                <select
                  name="base_role"
                  id="base_role"
                  value={formData.base_role || "employee-w"}
                  onChange={handleChange}
                  className="p-4 mx-2 border rounded-sm"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {PRESET_ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="flex justify-center my-6 w-full">
            <input
              type="submit"
              className="bg-pes text-white px-32 py-3 rounded-sm"
              value={"Create role"}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
