"use client";

import React, { useEffect, useState } from "react";
import { Add, SearchNormal1 } from "iconsax-react";
import { getAccessToken } from "@/app/utils/auth";
import Link from "next/link";
import Table, { TableColumn } from "@/app/components/ui/Table";

type Role = {
  id: string | number;
  name: string;
  assigned: number;
  // Add other properties if needed
};

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRoles() {
      const data = getAccessToken();
      try {
        const req = await fetch("/api/getRoles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: data }),
        });

        const res = await req.json();
        console.log(res);
        setRoles(res);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    getRoles();
  }, []);

  const columns: TableColumn<Role>[] = [
    {
      key: "sn",
      label: "S/N",
      width: "10%",
      render: (_, index) => index + 1,
    },
    { key: "name", label: "Name", width: "40%" },
    {
      key: "assigned",
      label: "Assigned Users",
      width: "50%",
      render: (i) => (
        <p className="rounded-full w-fit px-4 py-1 bg-gray-100 text-gray-700">
          {`${i.assigned} ${i.assigned !== 1 ? "users" : "user"}`}
        </p>
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
                placeholder="Search for Role"
                className="placeholder:text-xs placeholder:text-gray-300  focus:ring-gray-400 focus:border-gray-400 bg-[#fafafa] border-gray-50 h-[2.5rem] ps-16 max-md:w-full"
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
            data={roles}
            loading={loading}
            emptyMessage="No roles found. Create a role to get started."
          />
        </div>
      </div>
    </div>
  );
}
