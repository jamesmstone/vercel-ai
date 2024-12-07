"use client";

import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { useChat } from "ai/react";
import { SecretInput } from "@/app/secretInput";
function ClientChat() {
  const [secret, setSecret] = useLocalStorage<string>("secret", "");
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    headers: {
      "x-secret": secret,
    },
  });
  return (
    <>
      <SecretInput value={secret} onChange={setSecret} />
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
            {m.toolInvocations &&
              m.toolInvocations.map((t) => (
                <>
                  {t.toolName}({t.state})
                </>
              ))}
          </div>
        ))}

        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </>
  );
}
export default function Chat() {
  const isClient = useIsClient();

  if (!isClient) {
    // needed as ClientChat calls useLocalStorage that does not work when generating on server
    return null;
  }
  return <ClientChat />;
}
