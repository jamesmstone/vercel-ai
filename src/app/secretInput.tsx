"use client";

import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import React from "react";

export const SECRET_KEY = "secret";

function SecretInputClient() {
  const [value, setValue] = useLocalStorage<string>(SECRET_KEY, "");
  return (
    <div>
      <label htmlFor="secretInput">Secret:</label>
      <input
        id={"secretInput"}
        aria-label={"secret"}
        type={"password"}
        className="w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
        value={value}
        placeholder="secret token"
        onChange={(v) => setValue(v.target.value)}
      />
    </div>
  );
}

export function SecretInput() {
  const isClient = useIsClient();

  if (!isClient) {
    // needed as SecretInputClient calls useLocalStorage that does not work when generating on server
    return null;
  }
  return <SecretInputClient />;
}
