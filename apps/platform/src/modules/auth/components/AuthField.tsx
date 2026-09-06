type AuthFieldProps = {
  label: string;
  name: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
};

export function AuthField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
}: AuthFieldProps) {
  return (
    <label className="auth-field">
      <span className="auth-label">{label}</span>
      <input
        className="auth-input"
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
