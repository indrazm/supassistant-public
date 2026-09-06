import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authClient, postJson, type AuthUser } from "../client";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export function useRegister() {
  const navigate = useNavigate();
  const { refetch: refetchSession } = authClient.useSession();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      postJson<{ user: AuthUser }>("/api/auth/register", payload),
    onSuccess: async () => {
      // Registration happens on a custom endpoint, so Better Auth's session
      // store is stale until we refetch it.
      await refetchSession();
      await navigate({ to: "/" });
    },
  });
}
