import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authClient, postJson, type AuthUser } from "../client";

type LoginPayload = {
  email: string;
  password: string;
};

export function useLogin() {
  const navigate = useNavigate();
  const { refetch: refetchSession } = authClient.useSession();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      postJson<{ user: AuthUser | null }>("/api/auth/login", payload),
    onSuccess: async () => {
      // Login happens on a custom endpoint, so Better Auth's session store is
      // stale until we refetch it.
      await refetchSession();
      await navigate({ to: "/" });
    },
  });
}
