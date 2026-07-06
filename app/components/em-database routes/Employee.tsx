"use client";

import React, { useEffect, useState, useRef } from "react";
import { Add, SearchNormal1 } from "iconsax-react";
import Link from "next/link";
import { getAccessToken } from "@/app/utils/auth";

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  gsm: string;
  role: string;
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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dropdownQuery, setDropdownQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filteredEmployeesDropdown =
    dropdownQuery === ""
      ? employees
      : employees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(dropdownQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(dropdownQuery.toLowerCase()),
        );
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [resendingId, setResendingId] = useState<number | null>(null);

  async function handleResend(email: string, id: number) {
    setResendingId(id);
    try {
      const res = await fetch("/api/resendCredentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) alert(`Credentials resent to ${email} ✅`);
      else alert(`Failed: ${data.message}`);
    } catch {
      alert("Error resending credentials");
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
        alert("Failed to fetch employees ❌");
      } finally {
        setLoading(false);
      }
    }

    getEmployees();
  }, []);

  const handleAssign = async (post: string) => {
    if (!selectedUserId) {
      alert("Please select a Unit Head first ⚠️");
      return;
    }

    const selectedUser = employees.find((u) => u.id === selectedUserId);
    if (!selectedUser) {
      alert("Selected employee not found ❌");
      return;
    }

    setAssigning(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`api/assign-${post}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: selectedUser.email,
          org: selectedUser.org || "University of Lagos",
          dept: selectedUser.dept,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign HOD ❌");

      alert(`✅ ${data.message}`);
      setSelectedUserId(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error assigning HOD ❌");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex justify-center w-full h-full">
      <div className="m-4 bg-white w-full h-full">
        {/* Header */}

        <div className="flex justify-between max-md:py-2 max-md:h-fit w-full flex-row max-md:flex-col max-md:gap-2">
          <div className="flex items-center gap-3 mx-4 text-xs">
            <div className="flex flex-col justify-center">
              <h1 className="me-auto mx-2 mb-1">
                Total Enrolled Employees: {employees.length}
              </h1>
              <Link
                href="/em-database/add-employee"
                className="flex justify-center bg-pes text-white px-10 py-2 m-2 border h-fit border-pes my-auto text-center"
              >
                <span className="my-auto">Add an Employee</span>
                <Add size={20} className="my-auto ms-2" />
              </Link>
            </div>

            <div className="flex flex-col">
              <Link
                href="/em-database/add-auditor"
                className="flex w-[15rem] justify-center bg-blue-600 text-white py-2 mx-auto flex justify-center border h-fit border-pes my-2 rounded text-center"
              >
                <span className="my-auto">Add an External Auditor</span>
                <Add size={20} className="my-auto ms-2" />
              </Link>

              <button
                onClick={() => handleAssign("prod")}
                disabled={assigning}
                className={`flex justify-center w-[15rem] border border-pes text-pes py-2 mx-auto flex justify-center rounded hover:bg-gray-50 ${
                  assigning ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {assigning ? "Assigning..." : "Assign Production Engineer"}
              </button>
            </div>

            <div ref={wrapperRef}>
              {/* Input and Assign */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  {/* Search / Input box */}
                  Search record
                  <input
                    type="text"
                    placeholder="Select Unit Head"
                    value={
                      selectedUserId
                        ? `${employees.find((e) => e.id === selectedUserId)?.name} — ${
                            employees.find((e) => e.id === selectedUserId)?.role
                          }`
                        : dropdownQuery
                    }
                    onChange={(e) => {
                      setDropdownQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-pes"
                  />
                  {/* Dropdown list */}
                  {isDropdownOpen && (
                    <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border shadow-lg">
                      {filteredEmployeesDropdown.length === 0 ? (
                        <li className="px-4 py-2 text-gray-500 select-none">
                          No results found.
                        </li>
                      ) : (
                        filteredEmployeesDropdown.map((emp) => (
                          <li
                            key={emp.id}
                            onClick={() => {
                              setSelectedUserId(emp.id);
                              setDropdownQuery("");
                              setIsDropdownOpen(false);
                            }}
                            className="cursor-pointer px-4 py-2 hover:bg-pes hover:text-white"
                          >
                            {emp.name} — {emp.role}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col">
                  <span>Make searched employee an admin staff</span>

                  <button
                    onClick={() => handleAssign("hod")}
                    disabled={assigning}
                    className={`flex border border-pes text-pes px-4 py-2 rounded hover:bg-gray-50 mb-1 ${
                      assigning ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {assigning ? "Assigning..." : "Assign Dept Hod"}
                  </button>

                  <button
                    onClick={() => handleAssign("admin")}
                    disabled={assigning}
                    className={`flex border border-pes text-pes px-4 py-2 rounded hover:bg-gray-50 ${
                      assigning ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {assigning ? "Assigning..." : "Assign Dept Admin"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full text-bold flex flex-col">
          <div className="rw bg-gray-100 h-12 w-full flex text-gray-400">
            <div className="w-[5%] my-auto mx-auto flex justify-center">
              S/N
            </div>
            <div className="w-[20%] my-auto mx-auto flex justify-center">
              Name
            </div>
            <div className="w-[25%] my-auto mx-auto flex justify-center">
              Email
            </div>
            <div className="w-[10%] my-auto mx-auto flex justify-center">
              Role
            </div>
            <div className="w-[25%] my-auto mx-auto flex justify-center">
              Dept
            </div>
            <div className="w-[15%] my-auto mx-auto flex justify-center">
              Actions
            </div>
          </div>

          <div className="flex flex-col justify-between">
            {loading ? (
              <div className="flex flex-col w-full">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rw h-12 my-1 w-full flex bg-gray-100 rounded-md animate-pulse"
                  ></div>
                ))}
              </div>
            ) : employees.length > 0 ? (
              employees.map((i, key) => (
                <div
                  key={i.id}
                  className="rw h-12 w-full flex my-1 hover:bg-slate-50"
                >
                  <Link
                    href={`/em-database/${i.id}`}
                    className="flex flex-1 items-center"
                  >
                    <div className="w-[5%] my-auto font-semibold mx-auto flex justify-center">
                      {key + 1}
                    </div>
                    <div className="w-[20%] my-auto font-semibold mx-auto flex justify-center">
                      {i.name}
                    </div>
                    <div className="w-[25%] my-auto font-semibold mx-auto flex justify-center">
                      {i.email}
                    </div>
                    <div className="w-[10%] my-auto font-semibold mx-auto flex justify-center">
                      <p
                        className={`rounded-full w-fit px-4 py-1 bg-${roleColor(i.role)}-100 text-${roleColor(i.role)}-500`}
                      >
                        {i.role}
                      </p>
                    </div>
                    <div className="w-[25%] my-auto font-semibold mx-auto flex justify-start items-center ml-14">
                      {i.dept}
                    </div>
                  </Link>
                  <div className="w-[15%] my-auto flex justify-center">
                    <button
                      onClick={() => handleResend(i.email, i.id)}
                      disabled={resendingId === i.id}
                      className="text-xs border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      {resendingId === i.id
                        ? "Sending..."
                        : "Resend credentials"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-400 text-sm text-center">
                No employees found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
