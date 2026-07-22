"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Add, SearchNormal1, CloseCircle } from "iconsax-react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import Table, { TableColumn } from "@/app/components/ui/Table";
import {
  PRESET_ROLES,
  PRESET_ROLE_LABELS,
  PermissionKey,
} from "@/app/components/utils/roles";

type Role = {
  id: string | number;
  name: string;
  assigned: number;
  base_role?: string | null;
};

// Friendly labels for the permission flags shown in the modal.
const PERMISSION_LABELS: Record<PermissionKey, string> = {
  can_manage_user_roles: "Manage User Roles",
  can_access_employee_data: "Access Employee Data",
  access_employee_all: "— All Employees",
  access_employee_subordinates: "— Subordinates",
  access_employee_selected: "— Selected Employees",
  can_define_performance_metrics: "Define Performance Metrics",
  define_performance_all: "— All Employees",
  define_performance_subordinates: "— Subordinates",
  define_performance_selected: "— Selected Employees",
  can_access_reporting_hierarchy: "Access Reporting Hierarchy",
  can_manage_performance_reviews: "Manage Performance Reviews",
  manage_reviews_all: "— All Employees",
  manage_reviews_subordinates: "— Subordinates",
  manage_reviews_selected: "— Selected Employees",
};

const isPreset = (name: string) =>
  (PRESET_ROLES as readonly string[]).includes(name);
const roleLabel = (name: string) =>
  isPreset(name) ? PRESET_ROLE_LABELS[name as keyof typeof PRESET_ROLE_LABELS] : name;

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // View-permissions modal state
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean> | null>(null);
  const [permsLoading, setPermsLoading] = useState(false);

  useEffect(() => {
    async function getRoles() {
      const token = getAccessToken();
      try {
        const req = await fetch("/api/getRoles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const res = await req.json();
        if (Array.isArray(res)) setRoles(res);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    getRoles();
  }, []);

  async function openPermissions(role: Role) {
    setPermRole(role);
    setPerms(null);
    setPermsLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch("/api/getRolePermissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, role: role.name }),
      });
      setPerms(await res.json());
    } catch {
      setPerms({});
    } finally {
      setPermsLoading(false);
    }
  }

  // Presets first, then custom; each alphabetical. Filtered by search.
  const orderedRoles = useMemo(() => {
    const filtered = roles.filter((r) =>
      roleLabel(r.name).toLowerCase().includes(search.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      const ap = isPreset(a.name) ? 0 : 1;
      const bp = isPreset(b.name) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return roleLabel(a.name).localeCompare(roleLabel(b.name));
    });
  }, [roles, search]);

  const grantedList = perms
    ? (Object.keys(perms) as PermissionKey[]).filter((k) => perms[k])
    : [];

  const columns: TableColumn<Role>[] = [
    { key: "sn", label: "S/N", width: "8%", render: (_, index) => index + 1 },
    {
      key: "name",
      label: "Name",
      width: "28%",
      render: (r) => <span className="font-medium">{roleLabel(r.name)}</span>,
    },
    {
      key: "type",
      label: "Type",
      width: "14%",
      render: (r) =>
        isPreset(r.name) ? (
          <span className="rounded-full px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700">
            Preset
          </span>
        ) : (
          <span className="rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700">
            Custom
          </span>
        ),
    },
    {
      key: "base",
      label: "Behaves Like",
      width: "18%",
      render: (r) => (
        <span className="text-gray-600 text-sm">
          {isPreset(r.name) ? "—" : roleLabel(r.base_role || "employee-w")}
        </span>
      ),
    },
    {
      key: "assigned",
      label: "Assigned Users",
      width: "16%",
      render: (r) => (
        <span className="rounded-full w-fit px-4 py-1 bg-gray-100 text-gray-700">
          {`${r.assigned ?? 0} ${r.assigned !== 1 ? "users" : "user"}`}
        </span>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      width: "16%",
      render: (r) => (
        <button
          onClick={() => openPermissions(r)}
          className="text-pes text-sm font-medium border border-pes/30 rounded-md px-3 py-1.5 hover:bg-pes/5 transition-colors"
        >
          View Permissions
        </button>
      ),
    },
  ];

  return (
    <div className="flex justify-center w-full h-full">
      <div className="m-4 bg-white w-full h-full">
        <div className="flex justify-between h-[5rem] max-md:h-fit w-full max-md:py-2 max-md:flex-col max-md:gap-2">
          <div className="flex justify-between my-auto mx-4 bg-white">
            <label htmlFor="em-search" className="relative h-fit max-md:w-full">
              <SearchNormal1
                className="text-gray-300 absolute top-1/2 left-6 -translate-y-1/2"
                size={20}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for Role"
                className="placeholder:text-xs placeholder:text-gray-300 focus:ring-gray-400 focus:border-gray-400 bg-[#fafafa] border-gray-50 h-[2.5rem] ps-16 max-md:w-full"
              />
            </label>
          </div>

          <div className="flex justify-between my-auto mx-3 max-md:mx-0 max-md:self-center text-xs">
            <Link
              href="/em-database/create-role"
              className="flex justify-center bg-pes text-white px-10 py-2 m-4 border h-fit border-pes my-auto text-center"
            >
              <span className="my-auto">Create Role</span>
              <Add size={20} className="my-auto ms-2" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <Table
            columns={columns}
            data={orderedRoles}
            loading={loading}
            emptyMessage="No roles found. Create a role to get started."
          />
        </div>
      </div>

      {/* View Permissions modal */}
      {permRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-gray-100">
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-xl font-bold text-gray-800">
                Permissions for {roleLabel(permRole.name)}
              </h2>
              <button onClick={() => setPermRole(null)} aria-label="Close">
                <CloseCircle className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              {isPreset(permRole.name) ? "System preset role" : "Custom role"}
            </p>

            {permsLoading ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
            ) : grantedList.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No permissions granted to this role.
              </p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {grantedList.map((k) => (
                  <li key={k} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {PERMISSION_LABELS[k] || k}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
