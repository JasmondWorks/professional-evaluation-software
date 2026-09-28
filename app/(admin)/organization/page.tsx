'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Card, CardBody, CardHeader, PageHeader } from '@/app/components/ui';
import OrgLogoUploader from '@/app/components/OrgLogoUploader';
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

export const dynamic = 'force-dynamic';

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<{ name: string; logo_url: string | null } | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const orgId = token ? jwtDecode<any>(token)?.orgId : null;
    if (!orgId) return;

    apiFetch(`/api/org/${orgId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) setOrg({ name: res.data.name, logo_url: res.data.logo_url ?? null });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Organization settings"
        subtitle="Branding shown across the sidebar and login screen."
      />

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-strong">Logo</h2>
        </CardHeader>
        <CardBody>
          <OrgLogoUploader orgName={org?.name} logo={org?.logo_url} />
        </CardBody>
      </Card>
    </div>
  );
}
