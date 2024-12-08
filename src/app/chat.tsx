"use client";

import { useChat } from "ai/react";
import { SECRET_KEY } from "@/app/secretInput";
import React, { useRef, useState } from "react";
import { SECRET_HEADER } from "@/app/constants";
import { Message } from "@/app/message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CircleX, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type Message = ReturnType<typeof useChat>["messages"][0];

export default function Chat({ className }: { className?: string }) {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({
      experimental_throttle: 50,
    });
  return (
    <div
      className={cn("flex flex-col content-end items-center gap-4", className)}
    >
      {messages.map((m) => (
        <Message key={m.id} message={m} />
      ))}
      {error && (
        <Alert>
          <CircleX />
          <AlertTitle className="font-bold text-red-500">
            Error: {error.name}
          </AlertTitle>
          <AlertDescription>
            {error.message}
            <br />
            {JSON.stringify(error?.cause)} {error.stack}
          </AlertDescription>
          <Button variant="outline" onClick={() => reload()}>
            Retry <RotateCw />
          </Button>
        </Alert>
      )}

      <Alert>
        <form
          className="flex flex-row gap-2 items-end"
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
            className="flex-auto max-w-[100px]"
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
            tabIndex={1}
            className="flex-grow min-h-[24px]"
            rows={3}
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Input className="flex-1" type="submit" value="Send" />
        </form>
      </Alert>
    </div>
  );
}
