"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { Add, DocumentUpload, SearchNormal1 } from "iconsax-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import { notify } from "@/lib/toast";
import { TableColumn } from "@/app/components/ui/Table";
import DataTable from "@/app/components/ui/DataTable";
import RoleSelect from "@/app/components/ui/RoleSelect";
import Badge, { type BadgeTone } from "@/app/components/ui/Badge";
import { PRESET_ROLES, PRESET_ROLE_LABELS } from "@/app/components/utils/roles";
import { orgTerms } from "@/app/lib/orgTerms";
import { jwtDecode } from "jwt-decode";
import { apiFetch } from "@/app/utils/apiFetch";
import BulkUploadModal from "@/app/components/bulk-upload/BulkUploadModal";
import { employeeUploadSpec } from "@/app/lib/bulk-upload/specs/employees";

// Every system preset role, built from the canonical list so this dropdown can
// never diverge from the roles that actually exist (Roles table, seeding, etc.).
// Custom roles are appended below at runtime.
// The unit-head label adapts to the org sector (academic → Dean, else → Manager),
// so build options from the org's category rather than a fixed label map.
const buildAssignOptions = (category?: string | null) => {
  const head = orgTerms(category).head; // "Dean" | "Manager"
  return PRESET_ROLES.map((r) => ({
    value: r,
    label:
      r === "unit-head"
        ? `Faculty / Division Head (${head})`
        : PRESET_ROLE_LABELS[r],
  }));
};
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
  email_status?: string | null;
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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("hod");
  const [customRoles, setCustomRoles] = useState<{ name: string }[]>([]);
  // Org sector, to label the faculty/division head option (Dean vs Manager).
  const [orgCategory, setOrgCategory] = useState<string | null>(null);
  const assignPresetOptions = buildAssignOptions(orgCategory);
  // Current heads in the org, so we can warn before assigning a duplicate.
  const [heads, setHeads] = useState<{
    hodByDept: Record<string, { id: number; name: string | null }>;
    unitHeadByFaculty: Record<string, { id: number; name: string | null }>;
  }>({ hodByDept: {}, unitHeadByFaculty: {} });

  const [resendingId, setResendingId] = useState<number | null>(null);
  const resendingRef = useRef(false);
  const router = useRouter();

  // Load the org's custom roles for the Assign-Role dropdown (preset roles come
  // from ASSIGN_PRESET_OPTIONS; getRoles also returns presets, so filter them).
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const d: any = jwtDecode(token);
      setOrgCategory(d?.productCategory ?? d?.category ?? null);
    } catch {
      /* keep default labels */
    }
    apiFetch("/api/getRoles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data))
          setCustomRoles(
            data.filter(
              (r) =>
                r?.name &&
                !(PRESET_ROLES as readonly string[]).includes(r.name),
            ),
          );
      })
      .catch(() => {});
  }, []);

  // Load current department/faculty heads for the duplicate-head guard.
  const refreshHeads = () => {
    apiFetch("/api/role-heads")
      .then((r) => r.json())
      .then((d) => {
        if (d?.hodByDept)
          setHeads({
            hodByDept: d.hodByDept,
            unitHeadByFaculty: d.unitHeadByFaculty || {},
          });
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
      if (!dept)
        return {
          message:
            "This employee has no department set — set one before making them a Department Lead.",
        };
      const cur = heads.hodByDept[dept];
      if (cur && cur.id !== selectedEmployee.id)
        return {
          message: `${cur.name || "Another employee"} is already the Department Lead for “${dept}”. Change their role first.`,
        };
    }
    if (selectedRole === "unit-head") {
      const fac = selectedEmployee.faculty_college?.trim();
      if (!fac)
        return {
          message:
            "This employee has no faculty / division set — set one before making them its head.",
        };
      const cur = heads.unitHeadByFaculty[fac];
      if (cur && cur.id !== selectedEmployee.id)
        return {
          message: `${cur.name || "Another employee"} is already the head for “${fac}”. Change their role first.`,
        };
    }
    return null;
  })();

  async function handleResend(email: string, id: number) {
    // Ref guard: a fast double-click would otherwise fire two resets (two emails,
    // and the DB ends on the 2nd password while you may read the 1st).
    if (resendingRef.current) return;
    resendingRef.current = true;
    setResendingId(id);
    try {
      const res = await apiFetch("/api/resendCredentials", {
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
      resendingRef.current = false;
    }
  }

  // Static tone map → purge-safe Badge tones (dynamic `bg-${x}` classes don't
  // render under Tailwind v4's on-demand generation).
  function roleTone(role: string): BadgeTone {
    if (role === "dept-admin") return "brand";
    if (role === "auditor") return "warning";
    if (role === "hod") return "success";
    if (role === "lecturer") return "info";
    if (role === "industrial-engineer") return "danger";
    return "neutral";
  }

  // Lifted out of the effect so a bulk upload can refresh the list in place
  // rather than reloading the whole page.
  const refreshEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const req = await apiFetch("/api/getEmployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const res = await req.json();
      setEmployees(res);
    } catch (error) {
      console.error("Error fetching employees:", error);
      notify.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

  const handleModalAssign = async () => {
    if (!selectedEmployee) return;

    setAssigning(true);
    const toastId = notify.loading(`Assigning role...`);

    try {
      const res = await apiFetch(`/api/assign-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setEmployees(
        employees.map((emp) =>
          emp.id === selectedEmployee.id
            ? { ...emp, display_role: selectedRole }
            : emp,
        ),
      );
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
    <div className="w-full">
      <div className="w-full">
        {/* Header Section: count + add actions (page title lives in the tab bar) */}
        <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-8 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted">
            Total enrolled employees:{" "}
            <span className="font-semibold text-strong tabular-nums">
              {employees.length}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-pes-700 bg-surface border border-line rounded-lg shadow-xs hover:bg-pes-50 transition-colors"
            >
              <DocumentUpload size={18} />
              <span>Create multiple employees</span>
            </button>
            <Link
              href="/em-database/add-auditor"
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-pes-700 bg-surface border border-line rounded-lg shadow-xs hover:bg-pes-50 transition-colors"
            >
              <Add size={18} />
              <span>Add external auditor</span>
            </Link>
            <Link
              href="/em-database/add-employee"
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-white bg-pes rounded-lg shadow-xs hover:bg-pes-800 transition-colors"
            >
              <Add size={18} />
              <span>Add employee</span>
            </Link>
          </div>
        </div>

        <div className="w-full flex flex-col px-4 sm:px-6 lg:px-8 pb-8">
          <DataTable
            searchable
            searchKeys={["name", "email", "dept", "role", "display_role"]}
            searchPlaceholder="Search employees…"
            pageSize={10}
            columns={[
              {
                key: "sn",
                label: "S/N",
                width: "5%",
                align: "center",
                render: (_, index) => index + 1,
              },
              { key: "name", label: "Name", width: "20%" },
              {
                key: "email",
                label: "Email",
                width: "25%",
                render: (i: User) => (
                  <div className="flex items-center gap-2">
                    <span className="truncate">{i.email}</span>
                    {i.email_status === "bounced" && (
                      <span
                        title="Emails to this address bounced — it may be mistyped or not exist."
                        className="shrink-0 text-[10px] font-semibold text-danger-700 bg-danger-50 border border-danger-100 rounded-full px-2 py-0.5"
                      >
                        Undeliverable
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: "role",
                label: "Role",
                width: "10%",
                align: "center",
                render: (i) => (
                  <div className="flex justify-center">
                    <Badge tone={roleTone(i.role)} className="capitalize">
                      {i.display_role || i.role}
                    </Badge>
                  </div>
                ),
              },
              {
                key: "dept",
                label: "Dept",
                width: "25%",
                render: (i) => <span>{i.dept || "N/A"}</span>,
              },
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
                          title={
                            assigned ? "Click to reassign" : "Assign a role"
                          }
                          className={`text-xs border rounded px-3 py-1 font-medium transition-colors ${
                            assigned
                              ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                              : "border-blue-200 bg-pes-50 text-pes hover:bg-pes-100"
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
                      className="text-xs border border-line rounded px-3 py-1 hover:bg-line/50 disabled:opacity-50 transition-colors"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200 border border-line">
            <h2 className="text-xl font-bold text-strong mb-1">Assign Role</h2>
            <p className="text-sm text-muted mb-6">
              Select a new role for{" "}
              <span className="font-semibold text-strong">
                {selectedEmployee.name}
              </span>
              .
              <br />
              <span className="inline-block mt-2">
                Current Role:{" "}
                <span className="font-medium px-2.5 py-0.5 rounded-full bg-canvas text-body ml-1 text-xs">
                  {selectedEmployee.display_role || selectedEmployee.role}
                </span>
              </span>
            </p>

            <div className="flex flex-col gap-2 mb-8">
              <label className="text-sm font-medium text-body">Role</label>
              <RoleSelect
                value={selectedRole}
                presetRoles={assignPresetOptions}
                customRoles={customRoles}
                onSelect={setSelectedRole}
              />
              {headConflict && (
                <p className="text-sm text-danger-700 bg-danger-50 border border-danger-100 rounded-md px-3 py-2">
                  {headConflict.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={assigning}
                className="px-5 py-2.5 text-sm font-medium text-body hover:bg-line/50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleModalAssign}
                disabled={assigning || !!headConflict}
                title={headConflict ? headConflict.message : undefined}
                className="px-5 py-2.5 text-sm font-medium text-white bg-pes hover:bg-pes-800 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-30"
              >
                {assigning ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
      <BulkUploadModal
        spec={employeeUploadSpec}
        isOpen={bulkOpen}
        setIsOpen={setBulkOpen}
        onCompleted={() => {
          refreshEmployees();
          refreshHeads();
        }}
      />
    </div>
  );
}
