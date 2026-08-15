'use client';

import { ChangeEvent, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { jwtDecode } from 'jwt-decode';
import RoleSelect from '@/app/components/ui/RoleSelect';
import { PRESET_ROLES } from '@/app/components/utils/roles';
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { suggestEmail } from '@/app/utils/emailSuggest';

type FormProps = {
  formdata: Record<string, any>;
  setCredentialData: Dispatch<SetStateAction<Record<string, string>>>;
  updateFields: (data: Record<string, any>) => void;
  setStepValid: (data: boolean) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
};

// Advance focus to the next focusable form control on Enter
function advanceFocus(current: HTMLElement) {
  const focusable = Array.from(
    document.querySelectorAll<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
    )
  );
  const idx = focusable.indexOf(current);
  if (idx >= 0 && idx < focusable.length - 1) focusable[idx + 1].focus();
}

// --------------------------------------
// Stable Input — defined OUTSIDE FormOne
// so React never remounts it on re-render
// --------------------------------------
type InputProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  classNameProp?: string;
  tabIndex?: number;
  formdata: Record<string, any>;
  errors: Record<string, string>;
  updateFields: (data: Record<string, any>) => void;
  validateField: (name: string, value: string) => void;
};

function Input({
  name,
  label,
  type = 'text',
  placeholder,
  classNameProp,
  tabIndex,
  formdata,
  errors,
  updateFields,
  validateField,
}: InputProps) {
  const [localValue, setLocalValue] = useState(formdata[name] || '');

  // Sync when external value changes (e.g. form reset)
  useEffect(() => {
    setLocalValue(formdata[name] || '');
  }, [formdata[name]]);

  function commitValue(val: string) {
    updateFields({ [name]: val });
    validateField(name, val);
  }

  return (
    <div className={`formgroup flex flex-col gap-1.5 mb-3 w-full ${classNameProp}`}>
      <label className="text-sm font-medium text-body">{label}</label>
      <input
        name={name}
        type={type}
        value={localValue}
        placeholder={placeholder}
        tabIndex={tabIndex}
        onChange={(e) => {
          setLocalValue(e.target.value);
          commitValue(e.target.value);
        }}
        onBlur={(e) => commitValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitValue(localValue);
            advanceFocus(e.currentTarget);
          }
        }}
        className="w-full h-10 px-3 rounded-lg bg-surface border border-line text-strong text-sm placeholder:text-muted transition-shadow focus:outline-none focus:border-pes-400 focus:shadow-focus"
      />
      {errors[name] && <p className="text-danger-600 text-xs mt-1">{errors[name]}</p>}
    </div>
  );
}

// --------------------------------------
// Stable Phone Input — also outside FormOne
// --------------------------------------
function PhoneInput({
  name,
  label,
  placeholder,
  value,
  onChange,
  tabIndex,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  tabIndex?: number;
}) {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  function formatPhone(num: string) {
    num = num.replace(/\D/g, '');
    if (num.startsWith('234')) num = '+' + num;
    if (num.startsWith('0')) num = '+234' + num.slice(1);
    if (!num.startsWith('+234')) num = '+234' + num;

    const rest = num.replace('+234', '');
    const p1 = rest.slice(0, 3);
    const p2 = rest.slice(3, 6);
    const p3 = rest.slice(6, 10);

    let formatted = '+234';
    if (p1) formatted += ' ' + p1;
    if (p2) formatted += ' ' + p2;
    if (p3) formatted += ' ' + p3;
    return formatted;
  }

  function handleBlur() {
    const formatted = formatPhone(localValue);
    setLocalValue(formatted);
    onChange(formatted);
  }

  return (
    <div className="flex flex-col gap-1.5 mb-3 w-full">
      {label && (
        <label className="text-sm font-medium text-body">{label}</label>
      )}
      <input
        type="text"
        name={name}
        value={localValue}
        placeholder={placeholder}
        onChange={(e) => {
          const val = e.target.value.replace(/[^\d+]/g, '');
          setLocalValue(val);
          onChange(val);
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
            advanceFocus(e.currentTarget);
          }
        }}
        tabIndex={tabIndex}
        className="w-full h-10 px-3 rounded-lg bg-surface border border-line text-strong text-sm placeholder:text-muted transition-shadow focus:outline-none focus:border-pes-400 focus:shadow-focus"
        maxLength={16}
      />
    </div>
  );
}

// --------------------------------------
// MAIN FORM COMPONENT
// --------------------------------------
export default function FormOne({
  formdata,
  setCredentialData,
  updateFields,
  setStepValid,
  selectedFile,
  setSelectedFile,
}: FormProps) {
  const requiredFields = [
    'name', 'address', 'faculty_college', 'email', 'gsm', 'dept',
    'dob', 'doa', 'post', 'doc', 'role', 'dopp', 'level', 'year', 'qualification', 'credential',
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});

  // The "Employee Academic" (lecturer) role only applies to academic products.
  // Non-academic products (Company, Public) must not offer it.
  const [isAcademic, setIsAcademic] = useState(true);
  // Custom roles created on the Role & Permission page (from the roles table).
  const [customRoles, setCustomRoles] = useState<{ name: string }[]>([]);
  // Current department/faculty heads, for the duplicate-head guard.
  const [heads, setHeads] = useState<{
    hodByDept: Record<string, { id: number; name: string | null }>;
    unitHeadByFaculty: Record<string, { id: number; name: string | null }>;
  }>({ hodByDept: {}, unitHeadByFaculty: {} });
  useEffect(() => {
    try {
      const token = getAccessToken();
      if (!token) return;
      const decoded: any = jwtDecode(token);
      const category = String(decoded?.productCategory ?? decoded?.category ?? '').toLowerCase();
      if (category) setIsAcademic(category === 'academic');

      // Pull org-specific custom roles so they're selectable here too.
      apiFetch('/api/getRoles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          // getRoles now returns preset roles too (they're seeded rows); keep
          // only genuine custom roles for the "Custom Roles" section.
          if (Array.isArray(data))
            setCustomRoles(
              data.filter(
                (r) => r?.name && !(PRESET_ROLES as readonly string[]).includes(r.name),
              ),
            );
        })
        .catch(() => {});

      // Current heads, so we can warn before creating a duplicate one.
      apiFetch('/api/role-heads', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (d?.hodByDept) setHeads({ hodByDept: d.hodByDept, unitHeadByFaculty: d.unitHeadByFaculty || {} });
        })
        .catch(() => {});
    } catch {
      /* keep defaults */
    }
  }, []);

  // A new employee can't take a head role that's already filled for their
  // department/faculty. (Only 'hod' and 'unit-head' are head roles; the form
  // currently offers 'hod'. The server enforces this regardless.)
  const headConflict = (() => {
    const role = formdata.role;
    if (role === 'hod') {
      const dept = (formdata.dept || '').trim();
      if (!dept) return null; // dept required-check handles the empty case
      const cur = heads.hodByDept[dept];
      if (cur) return `${cur.name || 'Another employee'} is already the Department Lead for “${dept}”. Change their role first, or pick a different department.`;
    }
    if (role === 'unit-head') {
      const fac = (formdata.faculty_college || '').trim();
      if (!fac) return null;
      const cur = heads.unitHeadByFaculty[fac];
      if (cur) return `${cur.name || 'Another employee'} is already the head for “${fac}”. Change their role first, or pick a different faculty / division.`;
    }
    return null;
  })();

  function validateField(name: string, value: string) {
    let error = '';

    if (!value.trim()) error = 'This field is required.';

    if (name === 'email' && value.trim()) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(value)) error = 'Enter a valid email address.';
    }

    if (name === 'gsm' && value.trim()) {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) error = 'Phone number must be 7–15 digits.';
    }

    if (['dob', 'doa', 'doc', 'dopp'].includes(name) && value.trim()) {
      const today = new Date().toISOString().split('T')[0];
      if (value > today) error = 'Date cannot be in the future.';
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    updateFields({ [name]: value });
    validateField(name, value);
  }

  // When a role is selected, pre-fill Step 2's permission checkboxes from that
  // role's saved template (custom roles created on the Role & Permission page).
  // Presets have no template, so their permissions are cleared for manual entry.
  async function applyRolePermissions(role: string) {
    try {
      const token = getAccessToken();
      if (!token) return;
      const res = await apiFetch('/api/getRolePermissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role }),
      });
      if (!res.ok) return;
      const perms = await res.json();
      updateFields(perms);
    } catch {
      /* non-fatal — the admin can still set permissions manually in Step 2 */
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const labelName = e.target.id;
    const { name, value } = e.target;
    updateFields({ [name]: value });
    validateField(name, value);

    if (!file) return;

    setSelectedFile(file.name);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'pes_unsigned');
    data.append('folder', `pes/${formdata?.email}/credentials/${labelName}`);

    try {
      const cloudRes = await fetch('https://api.cloudinary.com/v1_1/duvqe45ds/image/upload', {
        method: 'POST',
        body: data,
      });
      const uploaded = await cloudRes.json();
      setCredentialData((prev: any) => ({ ...prev, [labelName]: uploaded.secure_url }));
    } catch (err) {
    }
  }

  useEffect(() => {
    const allFilled = requiredFields.every((f) => formdata[f]?.trim());
    const noErrors = Object.values(errors).every((err) => err === '');
    // A duplicate head also blocks progression (server enforces it regardless).
    setStepValid(allFilled && noErrors && !headConflict);
  }, [formdata, errors, headConflict]);

  // Shared props passed down to each Input
  const inputProps = { formdata, errors, updateFields, validateField };

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
        <div>
          <Input {...inputProps} name="name" label="Employee's Full Name:" placeholder="Enter full name" tabIndex={1} />
          <Input {...inputProps} name="address" label="Current Home Address:" placeholder="Home address" tabIndex={3} />
          <Input {...inputProps} name="faculty_college" label="Faculty/College:" placeholder="Enter faculty" tabIndex={5} />
        </div>
        <div>
          <Input {...inputProps} name="email" label="Employee's Email Address:" placeholder="Enter email" tabIndex={2} />
          {(() => {
            const suggestion = formdata.email ? suggestEmail(formdata.email) : null;
            if (!suggestion) return null;
            return (
              <p className="text-xs text-warning-600 mt-1">
                Did you mean{" "}
                <button
                  type="button"
                  className="underline font-medium"
                  onClick={() => {
                    updateFields({ email: suggestion });
                    validateField("email", suggestion);
                  }}
                >
                  {suggestion}
                </button>
                ?
              </p>
            );
          })()}
          <PhoneInput
            name="gsm"
            label="Phone Number:"
            placeholder="Enter phone number"
            value={formdata.gsm || ''}
            onChange={(v) => {
              updateFields({ gsm: v });
              validateField('gsm', v);
            }}
            tabIndex={4}
          />
          <Input {...inputProps} name="dept" label="Department:" placeholder="Enter department" tabIndex={6} />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5">
        <Input {...inputProps} name="dob" label="Date of birth:" type="date" tabIndex={7} />
        <Input {...inputProps} name="doa" label="Date of first appointment:" type="date" tabIndex={8} />
        <Input {...inputProps} name="post" label="Post/grade of first appointment:" placeholder="Enter post" tabIndex={9} />
        <Input {...inputProps} name="doc" label="Date of confirmation:" type="date" tabIndex={10} />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-2 w-full">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-body">Present post:</label>
          <RoleSelect
            value={formdata.role || ''}
            presetRoles={[
              ...(isAcademic ? [{ value: 'lecturer', label: 'Employee Academic' }] : []),
              {
                value: 'industrial-engineer',
                label: 'Employee Non-Academic (industrial/production engineer)',
              },
              { value: 'hod', label: 'Department Lead (HOD)' },
              {
                value: 'dept-admin',
                label: 'Departmental Administrator (records appraisal Forms 8 and 9)',
              },
              {
                value: 'unit-head',
                label: isAcademic ? 'Faculty Head (Dean)' : 'Division Head (Manager)',
              },
            ]}
            customRoles={customRoles}
            onSelect={(v) => {
              updateFields({ role: v });
              validateField('role', v);
              applyRolePermissions(v);
            }}
            tabIndex={11}
            hasError={!!errors.role}
          />
          {errors.role && <p className="text-danger-600 text-xs mt-1">{errors.role}</p>}
          {headConflict && (
            <p className="text-danger-700 text-xs mt-2 bg-danger-50 border border-danger-100 rounded-md px-2.5 py-1.5">
              {headConflict}
            </p>
          )}
        </div>
        <Input {...inputProps} name="dopp" label="Date appointed to present post:" type="date" tabIndex={12} />
        <Input {...inputProps} name="level" label="Current level:" placeholder="Current level" tabIndex={13} />
      </div>

      {/* Qualifications */}
      <div className="w-full flex flex-col gap-3">
        <p className="text-sm font-medium text-strong">
          Academic &amp; Professional Qualifications held
          <span className="font-normal text-muted"> — certificates must be attached</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 rounded-lg border border-line bg-canvas p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Title or qualification</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. B.Sc. Mechanical Engineering"
              name="qualification"
              value={formdata.qualification || ''}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg bg-surface border border-line text-strong text-sm placeholder:text-muted focus:outline-none focus:border-pes-400 focus:shadow-focus"
            />
          </div>

          <Input {...inputProps} name="year" label="Year obtained" type="date" />

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-body">Certificate</label>
            <label htmlFor="file" className="flex items-center gap-3 rounded-lg border border-line bg-surface pl-3 pr-1.5 py-1.5 cursor-pointer hover:border-pes-200 transition-colors">
              <span className="text-sm text-muted truncate flex-1">
                {selectedFile !== '' ? selectedFile : 'No file selected'}
              </span>
              <span className="shrink-0 rounded-md bg-pes-50 text-pes-700 text-sm font-medium px-3 py-1.5">
                Browse files
              </span>
              <input id="file" type="file" name="credential" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
