import React from "react";

export default function DataField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="my-2 flex flex-col">
      <p className="text-muted">{label}:</p>
      <p className="font-semibold text-lg">{value ? value : "N/A"}</p>
    </div>
  );
}
