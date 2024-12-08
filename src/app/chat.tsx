"use client";

import { useChat } from "ai/react";
import { SECRET_KEY } from "@/app/secretInput";
import React, { useRef, useState } from "react";
import { SECRET_HEADER } from "@/app/constants";
import { Message } from "@/app/message";

export type Message = ReturnType<typeof useChat>["messages"][0];

export default function Chat() {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({
      experimental_throttle: 50,
    });
  return (
    <div>
      {messages.map((m) => (
        <Message key={m.id} message={m} />
      ))}
      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}
      <form
        className="align-self-end place-self-end bottom-0 flex flex-row"
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
          className="p-2 mb-8 border border-gray-300 rounded shadow-xl"
          onChange={(event) => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <textarea
          className="flex-grow p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <input
          type="submit"
          className="p-2 mb-8 ml-2 border border-gray-300 rounded shadow-xl"
          value="Send"
        />
      </form>
    </div>
  );
}
