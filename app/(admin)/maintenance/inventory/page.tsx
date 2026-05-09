'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { ArrowLeft } from "iconsax-react";

type InventoryItem = {
  identification_symbol: string;
  description_of_facility: string;
  location: string;
  facility_register_id_no: string;
  type: string;
  priority_rating: string;
  remarks: string;
};

export default function MaintenanceInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const access_token = localStorage.getItem("access_token") as string;
    const tokenData = jwt.decode(access_token);

    async function fetchInventory() {
      const data = await fetch("/api/getInventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenData),
      });
      const InventoryData = await data.json();
      setInventory(InventoryData);
    }

    fetchInventory();
  }, []);

  return (
    <div className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <a href="/maintenance">
            <ArrowLeft className="me-4" />
          </a>
          <h1 className="text-2xl font-semibold">Inventory Sheet</h1>
        </div>
      </div>

      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID Symbol</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Register No.</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Priority</th>
            <th className="border px-4 py-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, key) => (
            <tr key={key} className="hover:bg-gray-50">
              <td className="border px-4 py-2">
                <Link href={`/maintenance/${encodeURIComponent(item.description_of_facility)}`}>
                  {item.identification_symbol}
                </Link>
              </td>
              <td className="border px-4 py-2">{item.description_of_facility}</td>
              <td className="border px-4 py-2">{item.location}</td>
              <td className="border px-4 py-2">{item.facility_register_id_no}</td>
              <td className="border px-4 py-2">{item.type}</td>
              <td className="border px-4 py-2">{item.priority_rating}</td>
              <td className="border px-4 py-2">{item.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
