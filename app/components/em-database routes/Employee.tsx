"use client";

import React, { useEffect, useState, useRef } from "react";
import { Add, SearchNormal1 } from "iconsax-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import { notify } from "@/lib/toast";
import Table, { TableColumn } from "@/app/components/ui/Table";
import RoleSelect from "@/app/components/ui/RoleSelect";
import { PRESET_ROLES, PRESET_ROLE_LABELS } from "@/app/components/utils/roles";

// Every system preset role, built from the canonical list so this dropdown can
// never diverge from the roles that actually exist (Roles table, seeding, etc.).
// Custom roles are appended below at runtime.
const ASSIGN_PRESET_OPTIONS = PRESET_ROLES.map((r) => ({
  value: r,
  label: PRESET_ROLE_LABELS[r],
}));
// A staff member counts as "assigned" once they hold one of these management roles.
const ASSIGNED_ROLES = ["hod", "dept-admin", "industrial-engineer"];

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  gsm: string;
  role: string;
  display_role?: string;
  address: string;
  faculty_college: string;
  dob: string;
  doa: string;
  poa: string;
  doc: string;
  post: string;
  dopp: string;
  level: string;
  image: string;
  org: string;
  dept: string;
};

export default function Employee() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("hod");
  const [customRoles, setCustomRoles] = useState<{ name: string }[]>([]);
  // Current heads in the org, so we can warn before assigning a duplicate.
  const [heads, setHeads] = useState<{
    hodByDept: Record<string, { id: number; name: string | null }>;
    unitHeadByFaculty: Record<string, { id: number; name: string | null }>;
  }>({ hodByDept: {}, unitHeadByFaculty: {} });

  const [resendingId, setResendingId] = useState<number | null>(null);
  const router = useRouter();

  // Load the org's custom roles for the Assign-Role dropdown (preset roles come
  // from ASSIGN_PRESET_OPTIONS; getRoles also returns presets, so filter them).
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    fetch("/api/getRoles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data))
          setCustomRoles(
            data.filter(
              (r) => r?.name && !(PRESET_ROLES as readonly string[]).includes(r.name),
            ),
          );
      })
      .catch(() => {});
  }, []);

  // Load current department/faculty heads for the duplicate-head guard.
  const refreshHeads = () => {
    const token = getAccessToken();
    if (!token) return;
    fetch("/api/role-heads", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.hodByDept) setHeads({ hodByDept: d.hodByDept, unitHeadByFaculty: d.unitHeadByFaculty || {} });
      })
      .catch(() => {});
  };
  useEffect(refreshHeads, []);

  // For the currently-selected employee + role, is this a duplicate head? Only
  // the explicit preset head roles are checked client-side; custom roles that
  // map to a head role are still caught by the server.
  const headConflict = (() => {
    if (!selectedEmployee) return null;
    if (selectedRole === "hod") {
      const dept = selectedEmployee.dept?.trim();
      if (!dept) return { message: "This employee has no department set — set one before making them a Department Lead." };
      const cur = heads.hodByDept[dept];
      if (cur && cur.id !== selectedEmployee.id)
        return { message: `${cur.name || "Another employee"} is already the Department Lead for “${dept}”. Change their role first.` };
    }
    if (selectedRole === "unit-head") {
      const fac = selectedEmployee.faculty_college?.trim();
      if (!fac) return { message: "This employee has no faculty / division set — set one before making them its head." };
      const cur = heads.unitHeadByFaculty[fac];
      if (cur && cur.id !== selectedEmployee.id)
        return { message: `${cur.name || "Another employee"} is already the head for “${fac}”. Change their role first.` };
    }
    return null;
  })();

  async function handleResend(email: string, id: number) {
    setResendingId(id);
    try {
      const res = await fetch("/api/resendCredentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        notify.success(`Credentials resent to ${email}`);
      } else {
        notify.error(`Failed: ${data.message}`);
      }
    } catch {
      notify.error("Error resending credentials");
    } finally {
      setResendingId(null);
    }
  }

  function roleColor(role: string) {
    if (role === "dept-admin") return "blue";
    if (role === "auditor") return "yellow";
    if (role === "hod") return "green";
    if (role === "lecturer") return "purple";
    if (role === "industrial-engineer") return "red";
    return "gray";
  }

  useEffect(() => {
    async function getEmployees() {
      setLoading(true);
      try {
        const token = getAccessToken();
        const req = await fetch("/api/getEmployee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const res = await req.json();
        setEmployees(res);
      } catch (error) {
        console.error("Error fetching employees:", error);
        notify.error("Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    }

    getEmployees();
  }, []);

  const handleModalAssign = async () => {
    if (!selectedEmployee) return;

    setAssigning(true);
    const toastId = notify.loading(`Assigning role...`);
    
    try {
      const token = getAccessToken();
      const res = await fetch(`/api/assign-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: selectedEmployee.email,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to assign role`);

      notify.dismiss(toastId);
      notify.success(data.message || `Role assigned successfully`);
      setIsModalOpen(false);

      // Show the selected role name as the employee's display role immediately.
      setEmployees(employees.map(emp =>
        emp.id === selectedEmployee.id ? { ...emp, display_role: selectedRole } : emp
      ));
      // Keep the heads map current so the guard reflects the new assignment.
      refreshHeads();

    } catch (err) {
      console.error(err);
      notify.dismiss(toastId);
      notify.error(err instanceof Error ? err.message : `Error assigning role`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex justify-center w-full h-full">
      <div className="m-4 bg-white w-full h-full">
        {/* Header Section */}
        <div className="flex flex-col gap-6 px-6 py-6 border-b border-gray-100">
          
          {/* Top Row: Title, Count, and Add Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Employee Database</h1>
              <p className="text-sm text-gray-500 mt-1">
                Total Enrolled Employees: <span className="font-semibold text-pes">{employees.length}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/em-database/add-auditor"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-pes bg-white border border-pes rounded-md hover:bg-pes hover:text-white transition-colors"
              >
                <Add size={18} /> 
                <span>Add External Auditor</span>
              </Link>
              <Link
                href="/em-database/add-employee"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-pes rounded-md shadow-sm hover:opacity-90 transition-opacity"
              >
                <Add size={18} /> 
                <span>Add Employee</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full text-bold flex flex-col">
          <Table 
            columns={[
              {
                key: "sn",
                label: "S/N",
                width: "5%",
                align: "center",
                render: (_, index) => index + 1,
              },
              { key: "name", label: "Name", width: "20%" },
              { key: "email", label: "Email", width: "25%" },
              {
                key: "role",
                label: "Role",
                width: "10%",
                align: "center",
                render: (i) => (
                  <p className={`rounded-full w-fit px-4 py-1 bg-${roleColor(i.role)}-100 text-${roleColor(i.role)}-500 mx-auto`}>
                    {i.display_role || i.role}
                  </p>
                ),
              },
              { key: "dept", label: "Dept", width: "25%" },
              {
                key: "actions",
                label: "Actions",
                width: "15%",
                align: "center",
                render: (i) => (
                  <div className="flex justify-center gap-2">
                    {(() => {
                      const assigned = ASSIGNED_ROLES.includes(i.role);
                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedEmployee(i);
                            setIsModalOpen(true);
                          }}
                          title={assigned ? "Click to reassign" : "Assign a role"}
                          className={`text-xs border rounded px-3 py-1 font-medium transition-colors ${
                            assigned
                              ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                              : "border-blue-200 bg-blue-50 text-pes hover:bg-blue-100"
                          }`}
                        >
                          {assigned ? "Role Assigned" : "Assign Role"}
                        </button>
                      );
                    })()}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleResend(i.email, i.id);
                      }}
                      disabled={resendingId === i.id}
                      className="text-xs border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      {resendingId === i.id ? "Sending..." : "Resend creds"}
                    </button>
                  </div>
                ),
              },
            ]}
            data={employees}
            loading={loading}
            emptyMessage="No employees found"
            onRowClick={(item) => router.push(`/em-database/${item.id}`)}
          />
        </div>
      </div>

      {/* Role Assignment Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Assign Role</h2>
            <p className="text-sm text-gray-500 mb-6">
              Select a new role for <span className="font-semibold text-gray-800">{selectedEmployee.name}</span>.
              <br />
              <span className="inline-block mt-2">
                Current Role: <span className="font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-1 text-xs">{selectedEmployee.display_role || selectedEmployee.role}</span>
              </span>
            </p>

            <div className="flex flex-col gap-2 mb-8">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <RoleSelect
                value={selectedRole}
                presetRoles={ASSIGN_PRESET_OPTIONS}
                customRoles={customRoles}
                onSelect={setSelectedRole}
              />
              {headConflict && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {headConflict.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={assigning}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleModalAssign}
                disabled={assigning || !!headConflict}
                title={headConflict ? headConflict.message : undefined}
                className="px-5 py-2.5 text-sm font-medium text-white bg-pes hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {assigning ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Assigning...
                  </span>
                ) : (
                  "Assign Role"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
