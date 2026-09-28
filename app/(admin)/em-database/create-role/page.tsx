"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import { PRESET_ROLES, presetRoleLabel } from "@/app/components/utils/roles";
import { useOrgCategory } from "@/app/lib/useOrgCategory";

// Mirrors ACADEMIC_ONLY_ROLES in app/api/_lib/createEmployee.ts, which can't be
// imported here — it pulls in Prisma/bcrypt, which don't belong in a client bundle.
const ACADEMIC_ONLY_BASE_ROLES = ["lecturer"];
import PermissionSelector from "@/app/components/ui/PermissionSelector";
import { apiFetch } from "@/app/utils/apiFetch";
import { BackLink, Button, Input } from "@/app/components/ui";

export default function CreateRole() {
  // Preset names read differently by institution type — see presetRoleLabel.
  const orgCategory = useOrgCategory();
  // base_role defaults to the baseline preset so the role is always mappable.
  const [formData, setFormData] = useState<Record<string, any>>({
    base_role: "employee-w",
  });
  const router = useRouter();

  const availableBaseRoles = PRESET_ROLES.filter(
    (r) => !ACADEMIC_ONLY_BASE_ROLES.includes(r) || orgCategory === "academic",
  );

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
        <h1 className="my-auto mx-6 font-semibold text-xl text-body">
          Create a role
        </h1>
        <BackLink href="/em-database">Back to Roles & Permissions</BackLink>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex border">
          <div className="border-r w-1/2">
            <div className="bg-canvas border-b h-[3rem] flex">
              <h1 className="my-auto mx-4 font-semibold">Role Details</h1>
            </div>
            <div className=" placeholder-slate-200 m-4">
              <Input
                label="Role Name:"
                onChange={handleChange}
                name="role_name"
                type="text"
                id="name"
                placeholder="Enter a name that represents the role's responsibilities and purpose."
                containerClassName="mb-4"
              />
              <Input
                label="Role Description:"
                onChange={handleChange}
                name="description"
                type="text"
                id="description"
                placeholder="Provide a brief description outlining the role's key responsibilities and purpose."
                containerClassName="mb-4"
              />
            </div>
          </div>
          <div className="w-1/2">
            <div className="bg-canvas border-b h-[3rem] flex">
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
            <div className="bg-canvas border-b h-[3rem] flex">
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
                  {availableBaseRoles.map((r) => (
                    <option key={r} value={r}>
                      {presetRoleLabel(r, orgCategory)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="flex justify-center my-6 w-full">
            <Button type="submit" size="lg" className="px-32">
              Create role
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
