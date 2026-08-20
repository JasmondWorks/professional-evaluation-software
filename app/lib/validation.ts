import { z } from 'zod';

/**
 * Common validation schemas for the application
 */

// User/Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  org: z.string().min(2, 'Organization name required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  category: z.string().min(1, 'Category required'),
  plan: z.string().min(1, 'Plan required'),
  // The PayPal subscription id returned from checkout. Proof of payment, so it
  // replaces the old hardcoded Paystack planCode.
  reference: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional(),
  agree: z.boolean().refine(val => val === true, 'You must agree to terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const confirmResetSchema = z.object({
  token: z.string().min(1, 'Token required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// Goal Schemas
export const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name required').max(200),
  description: z.string().min(1, 'Description required').max(1000),
  due_date: z.string().refine(
    (date) => {
      // A date input gives "YYYY-MM-DD" (midnight), so comparing against the
      // current instant would wrongly reject today. Compare date-only in local
      // time so today and any future day are accepted.
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return date >= todayStr;
    },
    { message: 'Due date cannot be in the past' }
  ),
  user_id: z.string().min(1, 'User ID required'),
  evaluation_type: z.enum(['appraisal', 'performance', 'stress']),
});

export const updateGoalSchema = z.object({
  id: z.string().min(1, 'Goal ID required'),
  name: z.string().min(1, 'Goal name required').max(200),
  description: z.string().min(1, 'Description required').max(1000),
  due_date: z.string().refine(
    (date) => {
      // A date input gives "YYYY-MM-DD" (midnight), so comparing against the
      // current instant would wrongly reject today. Compare date-only in local
      // time so today and any future day are accepted.
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return date >= todayStr;
    },
    { message: 'Due date cannot be in the past' }
  ),
  user_id: z.string().min(1, 'User ID required'),
});

// Employee Schemas
export const addEmployeeSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  gsm: z.string().regex(/^\+?[0-9\s-]{7,15}$/, 'Invalid phone number'),
  address: z.string().min(5).max(200),
  faculty_college: z.string().min(2).max(100),
  dept: z.string().min(2).max(100),
  dob: z.string().refine(
    (date) => {
      const d = new Date(date);
      const age = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 18 && age <= 100;
    },
    { message: 'Invalid date of birth' }
  ),
  doa: z.string(),
  post: z.string().min(2).max(100),
  doc: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  dopp: z.string().optional(),
  level: z.string().optional(),
  org: z.string().min(1),
});

// Performance Schemas
export const savePerformanceSchema = z.object({
  pesuser_name: z.string().min(1),
  org: z.union([z.string(), z.number()]),
  dept: z.union([z.string(), z.number()]).optional(),
  isCounter: z.boolean().optional(),
  payload: z.object({
    competence: z.union([z.string(), z.number()]),
    integrity: z.union([z.string(), z.number()]),
    compatibility: z.union([z.string(), z.number()]),
    use_of_resources: z.union([z.string(), z.number()]),
  }),
});

// Appraisal Schemas
export const saveAppraisalSchema = z.object({
  pesuser_name: z.string().min(1),
  org: z.union([z.string(), z.number()]),
  dept: z.union([z.string(), z.number()]).optional(),
  isCounter: z.boolean().optional(),
  payload: z.record(z.string(), z.union([z.string(), z.number()])),
});

// Stress Schemas
export const saveStressSchema = z.object({
  pesuser_name: z.string().min(1),
  org: z.union([z.string(), z.number()]),
  dept: z.union([z.string(), z.number()]).optional(),
  payload: z.object({
    stress_theme: z.union([z.string(), z.number()]),
    stress_feeling_frequency: z.union([z.string(), z.number()]),
  }),
});

// Role Schemas
export const createRoleSchema = z.object({
  role_name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  org: z.string().min(1),
  base_role: z.string().optional(),
  can_manage_user_roles: z.boolean().optional(),
  can_access_employee_data: z.boolean().optional(),
  access_employee_all: z.boolean().optional(),
  access_employee_subordinates: z.boolean().optional(),
  access_employee_selected: z.boolean().optional(),
  can_define_performance_metrics: z.boolean().optional(),
  define_performance_all: z.boolean().optional(),
  define_performance_subordinates: z.boolean().optional(),
  define_performance_selected: z.boolean().optional(),
  can_access_reporting_hierarchy: z.boolean().optional(),
  can_manage_performance_reviews: z.boolean().optional(),
  manage_reviews_all: z.boolean().optional(),
  manage_reviews_subordinates: z.boolean().optional(),
  manage_reviews_selected: z.boolean().optional(),
});

// Facility Schemas
export const addFacilitySchema = z.object({
  description: z.string().min(2).max(200),
  symbol: z.string().min(1).max(50),
  location: z.string().min(2).max(200),
  id: z.string().min(1).max(50),
  type: z.string().min(2).max(100),
  rating: z.union([z.string(), z.number()]).refine(
    (val) => {
      const num = typeof val === 'string' ? parseInt(val) : val;
      return num >= 0 && num <= 100;
    },
    { message: 'Rating must be between 0 and 100' }
  ),
  remark: z.string().max(500).optional(),
  org: z.string().min(1),
});

// Notification Schema
export const notificationSchema = z.object({
  org: z.union([z.string(), z.number()]),
});

/**
 * Validation helper function
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format Zod errors for API responses
 */
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  if ('issues' in errors) {
    (errors.issues as any[]).forEach((err: any) => {
      const path = err.path.join('.');
      formatted[path] = err.message;
    });
  } else if ('errors' in errors) {
    (errors as any).errors.forEach((err: any) => {
      const path = err.path.join('.');
      formatted[path] = err.message;
    });
  }
  return formatted;
}
