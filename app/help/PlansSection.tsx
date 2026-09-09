// The plans section of the guide.
//
// Unlike every other section, this one is not copy from the design bundle. It
// is generated from CATALOG (app/lib/billing/catalog.ts) and ENTITLEMENTS
// (app/lib/billing/entitlements.ts) — the same two files the server reads when
// it decides whether to answer a model request. A published table that says a
// tier includes something the software refuses is worse than no table, so the
// two cannot be allowed to drift apart.
//
// Prices are per year, in US dollars. A plan with no price set yet is shown as
// "Price on request" rather than as free.

import { CATALOG, INSTITUTION_TYPES, PLAN_TYPES, type InstitutionType } from '@/app/lib/billing/catalog';
import { ENTITLEMENTS, type Entitlement } from '@/app/lib/billing/entitlements';
import { MODEL_CATALOG } from '@/app/lib/models/catalog';

const INSTITUTION_LABEL: Record<InstitutionType, string> = {
  ACADEMIC: 'Academic',
  COMPANY: 'Company',
  PUBLIC: 'Public sector',
};

const INSTITUTION_BLURB: Record<InstitutionType, string> = {
  ACADEMIC:
    'Universities, polytechnics and colleges. The only product with the student/teacher ratio models, because it is the only one with students.',
  COMPANY:
    'Private companies and their divisions. The maintenance model is included at every tier here and nowhere else.',
  PUBLIC:
    'Ministries, agencies and parastatals. The same models as the company product, with maintenance available on request.',
};

const cellBase: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  lineHeight: 1.45,
  borderBottom: '1px solid var(--border-divider)',
  verticalAlign: 'top',
};

function priceLabel(price: number): string {
  if (!price) return 'Price on request';
  return `$${(price / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / year`;
}

function Mark({ state }: { state: 'yes' | 'no' | 'request' }) {
  if (state === 'yes') {
    return (
      <span style={{ color: 'var(--success-600)', fontWeight: 600 }} aria-label="Included">
        ✓
      </span>
    );
  }
  if (state === 'request') {
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 600,
          background: 'var(--warning-50)',
          color: 'var(--warning-900)',
        }}
      >
        On request
      </span>
    );
  }
  return (
    <span style={{ color: 'var(--text-secondary)' }} aria-label="Not included">
      —
    </span>
  );
}

/** The model a row belongs to, for the grouping column. */
function modelLabel(e: Entitlement): string {
  const first = e.models[0];
  return MODEL_CATALOG.find((m) => m.key === first)?.label ?? first;
}

function InstitutionTable({ institution }: { institution: InstitutionType }) {
  const plans = CATALOG.find((s) => s.institutionType === institution)?.plans ?? [];

  return (
    <div style={{ margin: '0 0 40px' }}>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '-.2px',
          margin: '32px 0 6px',
        }}
      >
        {INSTITUTION_LABEL[institution]} software
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--text-strong-secondary)',
          margin: '0 0 16px',
          maxWidth: '62ch',
        }}
      >
        {INSTITUTION_BLURB[institution]}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 16px' }}>
        {plans.map((p) => (
          <div
            key={p.name}
            style={{
              flex: '1 1 180px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '.04em',
                textTransform: 'uppercase',
                color: 'var(--brand-600)',
              }}
            >
              {p.name}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{priceLabel(p.price)}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 560,
            background: 'var(--surface-card)',
            borderRadius: 10,
          }}
        >
          <caption
            style={{
              captionSide: 'top',
              textAlign: 'left',
              fontSize: 12,
              color: 'var(--text-secondary)',
              padding: '0 0 8px',
            }}
          >
            What each {INSTITUTION_LABEL[institution].toLowerCase()} tier includes.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                style={{ ...cellBase, textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-secondary)' }}
              >
                Model
              </th>
              <th
                scope="col"
                style={{ ...cellBase, textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-secondary)' }}
              >
                What it does
              </th>
              {PLAN_TYPES.map((t) => (
                <th
                  key={t}
                  scope="col"
                  style={{ ...cellBase, textAlign: 'center', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-secondary)', width: 96 }}
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENTITLEMENTS.map((e) => {
              const ent = e as Entitlement;
              const onRequest = ent.onDemand?.includes(institution) ?? false;
              const available = PLAN_TYPES.some((t) => ent.plans[institution].includes(t));

              // A row excluded from this product entirely is dropped rather
              // than shown as three dashes.
              if (!available && !onRequest) return null;

              return (
                <tr key={e.key}>
                  <th
                    scope="row"
                    style={{ ...cellBase, textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {modelLabel(ent)}
                  </th>
                  <td style={{ ...cellBase, color: 'var(--text-strong-secondary)' }}>{ent.label}</td>
                  {PLAN_TYPES.map((t) => (
                    <td key={t} style={{ ...cellBase, textAlign: 'center' }}>
                      <Mark
                        state={
                          ent.plans[institution].includes(t)
                            ? 'yes'
                            : onRequest
                              ? 'request'
                              : 'no'
                        }
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PlansSection() {
  return (
    <>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: '-.5px',
          margin: '0 0 12px',
        }}
      >
        Plans — what each institution type and tier includes
      </h2>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: 'var(--text-strong-secondary)',
          margin: '0 0 20px',
          maxWidth: '62ch',
        }}
      >
        PES is sold as three products — one for academic institutions, one for
        companies and one for the public sector — each at three tiers. The tier
        decides which of the fourteen models your organization can open, and in
        several cases which <em>method</em> within a model: the operational
        staff model, for instance, is the plain method on Basic, plain and
        factored on Standard, and factored and work sampling on Premium.
      </p>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: 'var(--text-strong-secondary)',
          margin: '0 0 8px',
          maxWidth: '62ch',
        }}
      >
        These tables are generated from the same definitions the software
        enforces, so what you see here is exactly what your organization will be
        allowed to do. A model your plan excludes is hidden from the models page
        and refused by the server if reached directly — see{' '}
        <a href="#p9">Troubleshooting</a> if something you expected is missing.
      </p>

      {INSTITUTION_TYPES.map((i) => (
        <InstitutionTable key={i} institution={i} />
      ))}

      <div
        style={{
          background: 'var(--brand-50)',
          borderRadius: 10,
          padding: 16,
          margin: '8px 0 0',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>
          Two things worth knowing
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-strong-secondary)', margin: 0 }}>
          <strong>On request</strong> means the model is not part of the tier
          but can be bought for your organization; the maintenance model works
          this way for academic and public institutions, and is included
          outright for companies. And a plan is the outer boundary, not the
          whole story: within it, your organization&apos;s administrator decides
          which models each role may enter data into — so two people on the same
          plan can see different things.
        </p>
      </div>
    </>
  );
}
