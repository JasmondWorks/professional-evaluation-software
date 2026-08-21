import { addEmployeeSchema } from '@/app/lib/validation';
import type { BulkUploadSpec } from '../spec';
import type { ColumnSpec } from '../columns';

/** Bulk upload of staff into the employee database.
 *
 *  Note what is NOT a column: the fourteen permission booleans. A row carries a
 *  `role`, and the role resolves to a permission set server-side, exactly as the
 *  single-employee form already does. Fourteen columns of TRUE/FALSE would be
 *  unfillable by hand and unreadable on review. Anyone needing permissions that
 *  differ from their role's template is edited individually afterwards.
 *
 *  Also absent: qualification, credential and year. The single-employee form
 *  collects them but posts them to no endpoint and no column exists for them, so
 *  putting them in the template would promise storage that does not exist. */
export const EMPLOYEE_COLUMNS: ColumnSpec[] = [
  { key: 'name', label: 'Name', required: true, example: 'Ada Obi',
    aliases: ['full name', 'fullname', 'staff name', 'employee name'] },
  { key: 'email', label: 'Email', required: true, example: 'ada.obi@example.com',
    aliases: ['e mail', 'email address', 'mail'] },
  { key: 'gsm', label: 'Phone', required: true, example: '08031234567',
    aliases: ['phone', 'phone number', 'mobile', 'telephone', 'gsm number'] },
  { key: 'address', label: 'Address', required: true, example: '12 Herbert Macaulay Way, Yaba' },
  { key: 'faculty_college', label: 'Faculty or college', required: true, example: 'Engineering',
    aliases: ['faculty', 'college', 'faculty college', 'division'] },
  { key: 'dept', label: 'Department', required: true, example: 'Mechanical Engineering',
    aliases: ['department', 'dept name', 'unit'] },
  { key: 'dob', label: 'Date of birth', required: true, example: '1985-04-12',
    aliases: ['date of birth', 'birth date', 'birthdate'],
    hint: 'YYYY-MM-DD. The employee must be between 18 and 100.' },
  { key: 'doa', label: 'Date of appointment', required: true, example: '2015-09-01',
    aliases: ['date of appointment', 'appointment date', 'date appointed'],
    hint: 'YYYY-MM-DD.' },
  { key: 'post', label: 'Present post', required: true, example: 'Senior Lecturer',
    aliases: ['present post', 'position', 'job title', 'designation'] },
  { key: 'role', label: 'Role', required: true, example: 'lecturer',
    aliases: ['system role', 'access role', 'user role'],
    hint: 'Must exist for this institution type. Decides the permissions. Case does not matter.' },

  { key: 'doc', label: 'Date of confirmation', required: false, example: '2017-09-01',
    aliases: ['date of confirmation', 'confirmation date'] },
  { key: 'dopp', label: 'Date of present post', required: false, example: '2021-10-01',
    aliases: ['date of present post', 'date of promotion'] },
  { key: 'level', label: 'Level', required: false, example: '14',
    aliases: ['grade level', 'salary level'] },
  { key: 'poa', label: 'Place of appointment', required: false, example: 'Lagos',
    aliases: ['place of appointment'] },
];

export const employeeUploadSpec: BulkUploadSpec = {
  id: 'employees',
  entity: { singular: 'employee', plural: 'employees' },
  columns: EMPLOYEE_COLUMNS,
  schema: addEmployeeSchema,
  dedupeKey: 'email',
  endpoint: '/api/addEmployee/bulk',
  previewColumns: ['name', 'email', 'dept', 'role'],
  referenceChecks: [
    {
      referenceKey: 'roles',
      column: 'role',
      message: (value) =>
        String(value).trim().toLowerCase() === 'lecturer'
          ? `"${value}" applies to academic institutions only.`
          : `"${value}" does not exist in this organization. Create it on the Roles page first.`,
    },
  ],
  // addEmployeeSchema requires org, which the server always sets from the token.
  // The browser supplies a placeholder purely so validation can run.
  clientContext: { org: 'preview' },
  note: "Each person's permissions come from their role. Anyone needing something different can be edited after they are created.",
};
