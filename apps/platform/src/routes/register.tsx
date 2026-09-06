import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthAlert } from "../modules/auth/components/AuthAlert";
import { AuthCard } from "../modules/auth/components/AuthCard";
import { AuthField } from "../modules/auth/components/AuthField";
import { AuthSubmit } from "../modules/auth/components/AuthSubmit";
import { useRegister } from "../modules/auth/hooks/useRegister";
import "../modules/auth/auth.css";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    register.mutate({ name, email, password });
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Sign up with your email and a password."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthAlert message={register.error?.message} />
        <AuthField
          label="Name"
          name="name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Ada Lovelace"
          autoComplete="name"
        />
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
          autoComplete="new-password"
          minLength={8}
        />
        <AuthSubmit pending={register.isPending}>Create account</AuthSubmit>
      </form>
    </AuthCard>
  );
}
