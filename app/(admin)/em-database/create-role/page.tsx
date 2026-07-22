"use client";

import { ArrowLeft } from "iconsax-react";
import { useState } from "react";
import { toast } from "sonner";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import { PRESET_ROLES, PRESET_ROLE_LABELS } from "@/app/components/utils/roles";

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
      const req = fetch("/api/addRoles", {
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

              <div className="border-b p-4">
                <label className="flex">
                  <input
                    onChange={handleChange}
                    name="can_manage_user_roles"
                    type="checkbox"
                    className="h-6 w-6 mt-1 me-3"
                  />
                  <span className="w-10/12">
                    <h1 className="text-lg">Manage User Roles</h1>
                    <p>
                      Create, edit, and delete user roles, defining their
                      specific permissions and responsibilities.
                    </p>
                  </span>
                </label>
              </div>

              <div className="border-b p-4 flex flex-col">
                <label className="flex">
                  <input
                    onChange={handleChange}
                    name="can_access_employee_data"
                    type="checkbox"
                    className="h-6 w-6 mt-1 me-3"
                  />
                  <span className="w-10/12">
                    <h1 className="text-lg">Access Employee Data</h1>
                    <p>View and edit the details of employees.</p>
                  </span>
                </label>
                <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="access_employee_all"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>All Employees</span>
                  </label>
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="access_employee_subordinates"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>Subordinates</span>
                  </label>
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="access_employee_selected"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>Selected Employees</span>
                  </label>
                </div>
              </div>

              <div className="border-b p-4 flex flex-col">
                <label className="flex">
                  <input
                    onChange={handleChange}
                    name="can_define_performance_metrics"
                    type="checkbox"
                    className="h-6 w-6 mt-1 me-3"
                  />
                  <span className="w-10/12">
                    <h1 className="text-lg">Define Performance Metrics</h1>
                    <p>View and edit the performance metrics of employees.</p>
                  </span>
                </label>
                <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="define_performance_all"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>All Employees</span>
                  </label>
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="define_performance_subordinates"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>Subordinates</span>
                  </label>
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="define_performance_selected"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>Selected Employees</span>
                  </label>
                </div>
              </div>

              <div className="border-b p-4 flex flex-col">
                <label className="flex">
                  <input
                    onChange={handleChange}
                    name="can_access_reporting_hierarchy"
                    type="checkbox"
                    className="h-6 w-6 mt-1 me-3"
                  />
                  <span className="w-10/12">
                    <h1 className="text-lg">Access Reporting Hierachy</h1>
                    <p>
                      Define and modify the organizational reporting structure,
                      assigning managers to employees and creating teams.
                    </p>
                  </span>
                </label>
              </div>

              <div className="border-b p-4 flex flex-col">
                <label className="flex">
                  <input
                    onChange={handleChange}
                    name="can_manage_performance_reviews"
                    type="checkbox"
                    className="h-6 w-6 mt-1 me-3"
                  />
                  <span className="w-10/12">
                    <h1 className="text-lg">Manage Performance Reviews</h1>
                    <p>
                      Schedule, modify, or cancel performance review meetings
                      for any employee.
                    </p>
                  </span>
                </label>
                <div className="flex ms-8 my-2 text-gray-400 text-sm font-extralight">
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="manage_reviews_all"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>All Employees</span>
                  </label>
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="manage_reviews_subordinates"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>Subordinates</span>
                  </label>
                  <label className="flex me-4">
                    <input
                      onChange={handleChange}
                      name="manage_reviews_selected"
                      type="checkbox"
                      className="me-1"
                    />
                    <span>Selected Employees</span>
                  </label>
                </div>
              </div>
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
