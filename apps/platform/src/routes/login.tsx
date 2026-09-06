import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthAlert } from "../modules/auth/components/AuthAlert";
import { AuthCard } from "../modules/auth/components/AuthCard";
import { AuthField } from "../modules/auth/components/AuthField";
import { AuthSubmit } from "../modules/auth/components/AuthSubmit";
import { useLogin } from "../modules/auth/hooks/useLogin";
import "../modules/auth/auth.css";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back. Enter your credentials to continue."
      footer={
        <>
          No account? <Link to="/register">Create one</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthAlert message={login.error?.message} />
        <AuthField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <AuthSubmit pending={login.isPending}>Log in</AuthSubmit>
      </form>
    </AuthCard>
  );
}
