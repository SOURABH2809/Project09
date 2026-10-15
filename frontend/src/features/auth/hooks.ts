export {};
import { useMutation } from "@tanstack/react-query";
import { signin, signup, forgotPassword, resetPassword, changePassword } from "./api";

export function useSigninMutation() {
  return useMutation({ mutationFn: signin });
}

export function useSignupMutation() {
  return useMutation({ mutationFn: signup });
}
export const useForgotPasswordMutation = () => useMutation({ mutationFn: forgotPassword });
export const useResetPasswordMutation = () => useMutation({ mutationFn: resetPassword });
export const useChangePasswordMutation = () => useMutation({ mutationFn: changePassword });
