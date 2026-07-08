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
  planCode: z.string().min(1, 'Plan code required'),
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
      const d = new Date(date);
      return d > new Date();
    },
    { message: 'Due date must be in the future' }
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
      const d = new Date(date);
      return d > new Date();
    },
    { message: 'Due date must be in the future' }
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
  role: z.enum(['lecturer', 'industrial-engineer', 'hod', 'employee-w', 'auditor']),
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
  manage_user: z.boolean().optional(),
  access_em: z.boolean().optional(),
  ae_all: z.boolean().optional(),
  ae_sub: z.boolean().optional(),
  ae_sel: z.boolean().optional(),
  define_performance: z.boolean().optional(),
  dp_all: z.boolean().optional(),
  dp_sub: z.boolean().optional(),
  dp_sel: z.boolean().optional(),
  access_hierachy: z.boolean().optional(),
  manage_review: z.boolean().optional(),
  mr_all: z.boolean().optional(),
  mr_sub: z.boolean().optional(),
  mr_sel: z.boolean().optional(),
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
