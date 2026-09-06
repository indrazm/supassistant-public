import type { QueryClient } from "@tanstack/react-query";
import { Link, createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { authClient } from "../modules/auth/client";

export type RouterContext = {
  queryClient: QueryClient;
};

function AuthNav() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <span className="nav-session" />;
  }

  const user = session?.user;

  if (user) {
    return (
      <span className="nav-session">
        {user.name}
        <button type="button" onClick={() => void authClient.signOut()}>
          Sign out
        </button>
      </span>
    );
  }

  return (
    <span className="nav-session">
      <Link to="/login">Log in</Link>
      <Link to="/register">Register</Link>
    </span>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <AuthNav />
      </nav>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
