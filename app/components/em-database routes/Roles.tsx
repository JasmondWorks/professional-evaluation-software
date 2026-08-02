"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Add, SearchNormal1, CloseCircle, Edit2, Trash } from "iconsax-react";
import { getAccessToken } from "@/app/utils/auth";
import { notify } from "@/lib/toast";
import { jwtDecode } from "jwt-decode";
import Table, { TableColumn } from "@/app/components/ui/Table";
import PermissionSelector from "@/app/components/ui/PermissionSelector";
import {
  PRESET_ROLES,
  PRESET_ROLE_LABELS,
  PERMISSION_TREE,
  PermissionKey,
} from "@/app/components/utils/roles";
import { apiFetch } from '@/app/utils/apiFetch';

type Role = {
  id: string | number;
  name: string;
  assigned: number;
  base_role?: string | null;
};

const isPreset = (name: string) =>
  (PRESET_ROLES as readonly string[]).includes(name);
const roleLabel = (name: string) =>
  isPreset(name) ? PRESET_ROLE_LABELS[name as keyof typeof PRESET_ROLE_LABELS] : name;

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // View-permissions modal
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean> | null>(null);
  const [permsLoading, setPermsLoading] = useState(false);

  // Edit modal
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editPerms, setEditPerms] = useState<Record<string, boolean>>({});
  const [editBase, setEditBase] = useState<string>("employee-w");
  const [editSaving, setEditSaving] = useState(false);

  // Delete modal
  const [delRole, setDelRole] = useState<Role | null>(null);
  const [replacement, setReplacement] = useState<string>("employee-w");
  const [deleting, setDeleting] = useState(false);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cBase, setCBase] = useState("employee-w");
  const [cPerms, setCPerms] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  async function loadRoles() {
    const token = getAccessToken();
    try {
      const req = await apiFetch("/api/getRoles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const res = await req.json();
      if (Array.isArray(res)) setRoles(res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  async function fetchPermsFor(roleName: string): Promise<Record<string, boolean>> {
    const token = getAccessToken();
    const res = await apiFetch("/api/getRolePermissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, role: roleName }),
    });
    return res.json();
  }

  async function openPermissions(role: Role) {
    setPermRole(role);
    setPerms(null);
    setPermsLoading(true);
    try {
      setPerms(await fetchPermsFor(role.name));
    } catch {
      setPerms({});
    } finally {
      setPermsLoading(false);
    }
  }

  async function openEdit(role: Role) {
    setEditRole(role);
    setEditBase(role.base_role || "employee-w");
    setEditPerms({});
    try {
      setEditPerms(await fetchPermsFor(role.name));
    } catch {
      setEditPerms({});
    }
  }

  async function saveEdit() {
    if (!editRole) return;
    setEditSaving(true);
    const toastId = notify.loading("Saving role…");
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/updateRole", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          roleName: editRole.name,
          base_role: isPreset(editRole.name) ? undefined : editBase,
          permissions: editPerms,
        }),
      });
      const data = await res.json();
      notify.dismiss(toastId);
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      notify.success(data.message || "Role updated");
      setEditRole(null);
      loadRoles();
    } catch (e) {
      notify.dismiss(toastId);
      notify.error(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setEditSaving(false);
    }
  }

  async function confirmDelete() {
    if (!delRole) return;
    setDeleting(true);
    const toastId = notify.loading("Deleting role…");
    try {
      const token = getAccessToken();
      const res = await apiFetch("/api/deleteRole", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          roleName: delRole.name,
          replacementRole: delRole.assigned > 0 ? replacement : undefined,
        }),
      });
      const data = await res.json();
      notify.dismiss(toastId);
      if (!res.ok) throw new Error(data.error || "Failed to delete role");
      notify.success(
        data.reassigned
          ? `Role deleted; ${data.reassigned} staff reassigned.`
          : "Role deleted.",
      );
      setDelRole(null);
      loadRoles();
    } catch (e) {
      notify.dismiss(toastId);
      notify.error(e instanceof Error ? e.message : "Failed to delete role");
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setCName("");
    setCDesc("");
    setCBase("employee-w");
    setCPerms({});
    setCreateOpen(true);
  }

  async function submitCreate() {
    const name = cName.trim();
    if (!name) {
      notify.error("Role name is required.");
      return;
    }
    if (isPreset(name.toLowerCase())) {
      notify.error("That name is reserved for a system preset role.");
      return;
    }
    setCreating(true);
    const toastId = notify.loading("Creating role…");
    try {
      const token = getAccessToken() || "";
      const decoded: any = token ? jwtDecode(token) : {};
      const res = await apiFetch("/api/addRoles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_name: name,
          description: cDesc,
          org: decoded?.org || "",
          base_role: cBase,
          ...cPerms,
        }),
      });
      const data = await res.json();
      notify.dismiss(toastId);
      if (data.status !== 200) throw new Error(data.message || "Failed to create role");
      notify.success("Role created");
      setCreateOpen(false);
      loadRoles();
    } catch (e) {
      notify.dismiss(toastId);
      notify.error(e instanceof Error ? e.message : "Failed to create role");
    } finally {
      setCreating(false);
    }
  }

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

  // Roles a holder can be reassigned to when deleting (everything except the
  // role being deleted).
  const replacementOptions = useMemo(
    () => (delRole ? orderedRoles.filter((r) => r.name !== delRole.name) : []),
    [orderedRoles, delRole],
  );

  const grantedList = perms
    ? (Object.keys(perms) as PermissionKey[]).filter((k) => perms[k])
    : [];

  const columns: TableColumn<Role>[] = [
    { key: "sn", label: "S/N", width: "6%", render: (_, index) => index + 1 },
    {
      key: "name",
      label: "Name",
      width: "24%",
      render: (r) => <span className="font-medium">{roleLabel(r.name)}</span>,
    },
    {
      key: "type",
      label: "Type",
      width: "12%",
      render: (r) =>
        isPreset(r.name) ? (
          <span className="rounded-full px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700">Preset</span>
        ) : (
          <span className="rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700">Custom</span>
        ),
    },
    {
      key: "base",
      label: "Behaves Like",
      width: "16%",
      render: (r) => (
        <span className="text-body text-sm">
          {isPreset(r.name) ? "—" : roleLabel(r.base_role || "employee-w")}
        </span>
      ),
    },
    {
      key: "assigned",
      label: "Users",
      width: "12%",
      render: (r) => (
        <span className="rounded-full w-fit px-3 py-1 bg-canvas text-body text-sm">
          {`${r.assigned ?? 0}`}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "30%",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPermissions(r)}
            className="text-pes text-xs font-medium border border-pes/30 rounded-md px-2.5 py-1.5 hover:bg-pes/5 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => openEdit(r)}
            className="text-body text-xs font-medium border border-line rounded-md px-2.5 py-1.5 hover:bg-canvas transition-colors inline-flex items-center gap-1"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => {
              setDelRole(r);
              setReplacement("employee-w");
            }}
            disabled={isPreset(r.name)}
            title={isPreset(r.name) ? "System roles can't be deleted" : "Delete role"}
            className="text-red-600 text-xs font-medium border border-red-200 rounded-md px-2.5 py-1.5 hover:bg-red-50 transition-colors inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash size={14} /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex justify-center w-full h-full">
      <div className="m-4 bg-white w-full h-full">
        <div className="flex justify-between h-[5rem] max-md:h-fit w-full max-md:py-2 max-md:flex-col max-md:gap-2">
          <div className="flex justify-between my-auto mx-4 bg-white">
            <label htmlFor="em-search" className="relative h-fit max-md:w-full">
              <SearchNormal1 className="text-gray-300 absolute top-1/2 left-6 -translate-y-1/2" size={20} />
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
            <button
              onClick={openCreate}
              className="flex justify-center bg-pes text-white px-10 py-2 m-4 border h-fit border-pes my-auto text-center"
            >
              <span className="my-auto">Create Role</span>
              <Add size={20} className="my-auto ms-2" />
            </button>
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

      {/* VIEW PERMISSIONS MODAL */}
      {permRole && (
        <Modal title={`Permissions for ${roleLabel(permRole.name)}`} onClose={() => setPermRole(null)}>
          <p className="text-sm text-muted mb-5">
            {isPreset(permRole.name) ? "System preset role" : "Custom role"}
          </p>
          {permsLoading ? (
            <p className="text-sm text-muted py-6 text-center">Loading…</p>
          ) : grantedList.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No permissions granted to this role.</p>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {PERMISSION_TREE.filter((n) => perms?.[n.key]).map((n) => (
                <li key={n.key} className="text-sm text-body">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {n.label}
                  </div>
                  {n.children.filter((c) => perms?.[c.key]).length > 0 && (
                    <div className="ms-5 text-xs text-muted">
                      {n.children.filter((c) => perms?.[c.key]).map((c) => c.label).join(" · ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editRole && (
        <Modal title={`Edit ${roleLabel(editRole.name)}`} onClose={() => setEditRole(null)} wide>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-body">Role Name</label>
              <input
                value={roleLabel(editRole.name)}
                disabled
                className="mt-1 w-full px-4 py-2.5 border border-line rounded-lg bg-canvas text-muted"
              />
              <p className="text-xs text-muted mt-1">Role name can't be changed.</p>
            </div>

            {!isPreset(editRole.name) && (
              <div>
                <label className="text-sm font-medium text-body">Behaves Like</label>
                <select
                  value={editBase}
                  onChange={(e) => setEditBase(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 border border-line rounded-lg"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r} value={r}>{PRESET_ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-body">Permissions</label>
              <div className="mt-1 border rounded-md">
                <PermissionSelector
                  value={editPerms}
                  onChange={(patch) => setEditPerms((prev) => ({ ...prev, ...patch }))}
                />
              </div>
            </div>

            <p className="text-xs text-muted">
              Saving updates this role and everyone currently assigned to it.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-line">
            <button onClick={() => setEditRole(null)} disabled={editSaving} className="px-5 py-2.5 text-sm font-medium text-body hover:bg-line/50 rounded-lg disabled:opacity-50">Cancel</button>
            <button onClick={saveEdit} disabled={editSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-pes hover:bg-pes-800 rounded-lg disabled:opacity-70">
              {editSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {delRole && (
        <Modal title={`Delete "${roleLabel(delRole.name)}"?`} onClose={() => setDelRole(null)}>
          {delRole.assigned > 0 ? (
            <>
              <p className="text-sm text-body mb-4">
                <span className="font-semibold text-strong">{delRole.assigned}</span>{" "}
                staff member{delRole.assigned === 1 ? "" : "s"} currently hold this role. They must be
                reassigned to another role before it can be deleted.
              </p>
              <label className="text-sm font-medium text-body">Reassign them to</label>
              <select
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 border border-line rounded-lg mb-2"
              >
                {replacementOptions.map((r) => (
                  <option key={r.name} value={r.name}>{roleLabel(r.name)}</option>
                ))}
              </select>
            </>
          ) : (
            <p className="text-sm text-body mb-4">
              No staff hold this role. It will be permanently deleted.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-line">
            <button onClick={() => setDelRole(null)} disabled={deleting} className="px-5 py-2.5 text-sm font-medium text-body hover:bg-line/50 rounded-lg disabled:opacity-50">Cancel</button>
            <button onClick={confirmDelete} disabled={deleting} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-70">
              {deleting ? "Deleting…" : delRole.assigned > 0 ? "Reassign & Delete" : "Delete Role"}
            </button>
          </div>
        </Modal>
      )}

      {/* CREATE MODAL */}
      {createOpen && (
        <Modal title="Create a role" onClose={() => setCreateOpen(false)} wide>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-body">Role Name</label>
              <input
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="e.g. Registry Officer"
                className="mt-1 w-full px-4 py-2.5 border border-line rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-body">Role Description</label>
              <input
                value={cDesc}
                onChange={(e) => setCDesc(e.target.value)}
                placeholder="Brief description of the role's purpose"
                className="mt-1 w-full px-4 py-2.5 border border-line rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-body">Behaves Like</label>
              <select
                value={cBase}
                onChange={(e) => setCBase(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 border border-line rounded-lg"
              >
                {PRESET_ROLES.map((r) => (
                  <option key={r} value={r}>{PRESET_ROLE_LABELS[r]}</option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">
                Which system role this custom role behaves as (screens & navigation).
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-body">Permissions</label>
              <div className="mt-1 border rounded-md">
                <PermissionSelector
                  value={cPerms}
                  onChange={(patch) => setCPerms((prev) => ({ ...prev, ...patch }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-line">
            <button onClick={() => setCreateOpen(false)} disabled={creating} className="px-5 py-2.5 text-sm font-medium text-body hover:bg-line/50 rounded-lg disabled:opacity-50">Cancel</button>
            <button onClick={submitCreate} disabled={creating} className="px-5 py-2.5 text-sm font-medium text-white bg-pes hover:bg-pes-800 rounded-lg disabled:opacity-70">
              {creating ? "Creating…" : "Create Role"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Small shared modal shell.
function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-lg" : "max-w-md"} p-6 border border-line max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-xl font-bold text-strong">{title}</h2>
          <button onClick={onClose} aria-label="Close">
            <CloseCircle className="text-muted hover:text-red-500" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
