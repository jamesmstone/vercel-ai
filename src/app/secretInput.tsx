"use client";

import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import React from "react";
import { Input } from "@/components/ui/input";

export const SECRET_KEY = "secret";

function SecretInputBase({
  value,
  setValue,
  disabled = false,
}: {
  value: string;
  setValue: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor="secretInput">Secret:</label>
      <Input
        disabled={disabled}
        id={"secretInput"}
        aria-label={"secret"}
        type={"password"}
        value={value}
        placeholder="secret token"
        onChange={(v) => setValue(v.target.value)}
      />
    </div>
  );
}
function SecretInputClient() {
  const [value, setValue] = useLocalStorage<string>(SECRET_KEY, "");
  return <SecretInputBase value={value} setValue={setValue} />;
}

export function SecretInput() {
  const isClient = useIsClient();

  if (!isClient) {
    // needed as SecretInputClient calls useLocalStorage that does not work when generating on server
    return <SecretInputBase disabled value="" setValue={() => {}} />;
  }
  return <SecretInputClient />;
}
