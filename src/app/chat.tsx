"use client";

import { useChat } from "ai/react";
import { SECRET_KEY } from "@/app/secretInput";
import React, { useRef, useState } from "react";
import { SECRET_HEADER } from "@/app/constants";
import { Message } from "@/app/message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
        <Input
          type="file"
          onChange={(event) => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <Textarea
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

        <Input type="submit" value="Send" />
      </form>
    </div>
  );
}
