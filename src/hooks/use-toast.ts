import { useMemo } from "react";
import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  const toast = useMemo(() => {
    const toastFn = (options: {
      title?: string;
      description?: string;
      variant?: string;
    }) => {
      const message = options.description || options.title || "";
      const toastId =
        options.variant === "destructive"
          ? sonnerToast.error(message)
          : sonnerToast.success(message);

      return {
        dismiss: () => sonnerToast.dismiss(toastId),
      };
    };

    // Add methods to the toast function
    toastFn.success = (message: string) => sonnerToast.success(message);
    toastFn.error = (message: string) => sonnerToast.error(message);
    toastFn.dismiss = (id?: string | number) => sonnerToast.dismiss(id);

    return toastFn;
  }, []);

  return { toast };
};
