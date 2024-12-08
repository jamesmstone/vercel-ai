import { Markdown } from "@/app/components/custom/markdown";
import React from "react";
import Image from "next/image";
import { type Message } from "@/app/chat";

export function Message({ message: message }: { message: Message }) {
  return (
    <div key={message.id} className="whitespace-pre-wrap">
      {message.role === "user" ? "User: " : "AI: "}
      <Markdown>{message.content}</Markdown>
      {message.toolInvocations &&
        message.toolInvocations.map((t) => (
          <React.Fragment key={t.toolCallId}>
            {t.toolName}({t.state})
          </React.Fragment>
        ))}
      <div>
        {message?.experimental_attachments?.map((attachment, index) => {
          return (
            <div
              key={`${message.id}-${index}`}
              className="w-36 h-36 flex flex-col items-center justify-center border border-gray-300 rounded shadow-lg p-2"
            >
              {attachment?.contentType?.startsWith("image/") ? (
                <Image
                  key={`${message.id}-${index}`}
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
      </div>
    </div>
  );
}
