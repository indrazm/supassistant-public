type AuthSubmitProps = {
  pending: boolean;
  children: string;
};

export function AuthSubmit({ pending, children }: AuthSubmitProps) {
  return (
    <button className="auth-submit" type="submit" disabled={pending}>
      {pending ? "Please wait…" : children}
    </button>
  );
}
