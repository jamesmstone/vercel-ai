export function SecretInput(props: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
      value={props.value}
      placeholder="secret"
      onChange={(v) => props.onChange(v.target.value)}
    />
  );
}
