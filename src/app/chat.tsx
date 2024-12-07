"use client";

import { useChat } from "ai/react";
import { SECRET_KEY, SecretInput } from "@/app/secretInput";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { SECRET_HEADER } from "@/app/constants";

export default function Chat() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({
      experimental_throttle: 50,
    });
  return (
    <>
      <SecretInput />
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
            {m.toolInvocations &&
              m.toolInvocations.map((t) => (
                <React.Fragment key={t.toolCallId}>
                  {t.toolName}({t.state})
                </React.Fragment>
              ))}
            <div>
              {m?.experimental_attachments?.map((attachment, index) => {
                return (
                  <div
                    key={`${m.id}-${index}`}
                    className="w-36 h-36 flex flex-col items-center justify-center border border-gray-300 rounded shadow-lg p-2"
                  >
                    {attachment?.contentType?.startsWith("image/") ? (
                      <Image
                        key={`${m.id}-${index}`}
                        src={attachment.url}
                        width={36}
                        height={36}
                        alt={attachment.name ?? `attachment-${index}`}
                      />
                    ) : (
                      <>
                        <span>{attachment.name ?? `attachment-${index}`}</span>
                        <span className="text-sm text-gray-500">
                          {attachment.contentType}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
              {error && (
                <>
                  <div>An error occurred.</div>
                  <button type="button" onClick={() => reload()}>
                    Retry
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        <form
          onSubmit={(event) => {
            const jsonSecretFromLocal = window.localStorage.getItem(SECRET_KEY);
            handleSubmit(event, {
              headers: {
                [SECRET_HEADER]:
                  jsonSecretFromLocal === null
                    ? ""
                    : JSON.parse(jsonSecretFromLocal),
              },
              experimental_attachments: files,
            });

            setFiles(undefined);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          <input
            type="file"
            className=""
            onChange={(event) => {
              if (event.target.files) {
                setFiles(event.target.files);
              }
            }}
            multiple
            ref={fileInputRef}
          />
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
