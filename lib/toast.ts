import { toast as sonnerToast } from "sonner";

/**
 * App-wide toast helper. Wraps sonner with consistent defaults so callers
 * don't repeat options everywhere.
 *
 * @example
 *   import { notify } from "@/lib/toast";
 *   notify.success("Profile updated");
 *   notify.error("Something went wrong");
 *   notify.promise(saveData(), { loading: "Saving…", success: "Saved!", error: "Failed to save" });
 */
export const notify = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),

  loading: (message: string) => sonnerToast.loading(message),

  /** Tie a toast to an async action's lifecycle. */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
  ) => sonnerToast.promise(promise, messages),

  /** Programmatically dismiss a toast (or all if no id given). */
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

// Re-export the raw sonner toast for advanced/custom cases.
export { sonnerToast as toast };
