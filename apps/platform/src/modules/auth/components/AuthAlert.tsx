type AuthAlertProps = {
  message: string | null | undefined;
};

export function AuthAlert({ message }: AuthAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="auth-alert" role="alert">
      {message}
    </p>
  );
}
