import { Markdown } from "@/components/custom/markdown";
import React from "react";
import Image from "next/image";
import { type Message } from "@/app/chat";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BotMessageSquare, SquareUserRound } from "lucide-react";
import { cn } from "@/lib/utils";
export function Message({ message: message }: { message: Message }) {
  return (
    <motion.div
      className={cn("flex flex-row gap-4 px-4 w-full first-of-type:pt-20")}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      key={message.id}
    >
      <Alert>
        {message.role === "user" ? <SquareUserRound /> : <BotMessageSquare />}
        <AlertTitle>
          {message.role[0].toUpperCase() + message.role.slice(1).toLowerCase()}{" "}
          {message.toolInvocations && " thinking"}
        </AlertTitle>

        <AlertDescription>
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
                  className={cn(
                    "w-36 h-36 flex flex-col items-center justify-center border border-gray-300 rounded shadow-lg p-2",
                  )}
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
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
