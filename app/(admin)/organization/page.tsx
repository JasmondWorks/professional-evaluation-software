'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Card, CardBody, CardHeader, PageHeader } from '@/app/components/ui';
import OrgLogoUploader from '@/app/components/OrgLogoUploader';
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';

export const dynamic = 'force-dynamic';

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<{
    name: string;
    logo_url: string | null;
    coat_of_arms_url: string | null;
  } | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const orgId = token ? jwtDecode<any>(token)?.orgId : null;
    if (!orgId) return;

    apiFetch(`/api/org/${orgId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.data)
          setOrg({
            name: res.data.name,
            logo_url: res.data.logo_url ?? null,
            coat_of_arms_url: res.data.coat_of_arms_url ?? null,
          });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Organization settings"
        subtitle="Branding shown across the sidebar, the login screen, and every award document."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-strong">Institution logo</h2>
          </CardHeader>
          <CardBody>
            <OrgLogoUploader orgName={org?.name} logo={org?.logo_url} mark="logo" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-strong">National coat of arms</h2>
            <p className="mt-1 text-sm text-muted">
              Printed beside the institution logo on certificates, badges, the Books of
              Records and the Hall of Fame record. Leave it empty if your organization does
              not use one.
            </p>
          </CardHeader>
          <CardBody>
            <OrgLogoUploader
              orgName={org?.name}
              logo={org?.coat_of_arms_url}
              mark="coat-of-arms"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
