"use client";

import { useEffect, useState } from "react";
import { apiFetch } from '@/app/utils/apiFetch';

interface Org {
  id: number;
  name: string;
}

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/orgs")
      .then((res) => res.json())
      .then((data) => setOrgs(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading organizations...</p>;
  if (!orgs.length) return <p>No organizations found.</p>;

  return (
    <div>
      <h1>Organizations</h1>
      <ul>
        {orgs.map((org) => (
          <li key={org.id}>{org.name}</li>
        ))}
      </ul>
    </div>
  );
}
