"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { ArrowLeft } from "iconsax-react";
import { getAccessToken } from "@/app/utils/auth";
import { apiFetch } from '@/app/utils/apiFetch';
import { DataTable } from "@/app/components/ui/DataTable";
import { PageHeader } from "@/app/components/ui";
import type { TableColumn } from "@/app/components/ui/Table";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access_token = getAccessToken() as string;
    const tokenData = jwt.decode(access_token);

    async function fetchInventory() {
      try {
        const data = await apiFetch("/api/getInventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tokenData),
        });
        const InventoryData = await data.json();
        setInventory(Array.isArray(InventoryData) ? InventoryData : []);
      } catch {
        setInventory([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const columns: TableColumn<InventoryItem>[] = [
    {
      key: "identification_symbol",
      label: "ID symbol",
      render: (item) => (
        <Link
          href={`/maintenance/${encodeURIComponent(item.description_of_facility)}`}
          className="font-medium text-pes-700 hover:underline"
        >
          {item.identification_symbol}
        </Link>
      ),
    },
    { key: "description_of_facility", label: "Description" },
    { key: "location", label: "Location" },
    { key: "facility_register_id_no", label: "Register no." },
    { key: "type", label: "Type" },
    { key: "priority_rating", label: "Priority" },
    { key: "remarks", label: "Remarks" },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/maintenance"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-pes transition-colors mb-4"
      >
        <ArrowLeft size={18} />
        Back to maintenance
      </Link>

      <PageHeader title="Inventory sheet" />

      <DataTable
        columns={columns}
        data={inventory}
        loading={loading}
        searchable
        searchKeys={["identification_symbol", "description_of_facility", "location", "type", "priority_rating"]}
        searchPlaceholder="Search inventory…"
        pageSize={15}
        emptyMessage="No inventory items yet."
      />
    </div>
  );
}
