import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      className="whitespace-pre-wrap"
      remarkPlugins={[remarkGfm]}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        code: ({ inline, className, children, node: _, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <pre
              {...props}
              className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
            >
              <code className={match[1]}>{children}</code>
            </pre>
          ) : (
            <code
              className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
              {...props}
            >
              {children}
            </code>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ol: ({ children, node: _, ...props }) => {
          return (
            <ol className="list-decimal list-outside ml-4" {...props}>
              {children}
            </ol>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        li: ({ children, node: _, ...props }) => {
          return (
            <li className="" {...props}>
              {children}
            </li>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ul: ({ children, node: _, ...props }) => {
          return (
            <ul className="list-decimal list-outside ml-4" {...props}>
              {children}
            </ul>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        strong: ({ children, node: _, ...props }) => {
          return (
            <span className="font-semibold" {...props}>
              {children}
            </span>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h1: ({ children, node: _, ...props }) => {
          return (
            <h1 className="text-3xl font-bold mt-4 mb-2" {...props}>
              {children}
            </h1>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h2: ({ children, node: _, ...props }) => {
          return (
            <h2 className="text-2xl font-bold mt-4 mb-2" {...props}>
              {children}
            </h2>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h3: ({ children, node: _, ...props }) => {
          return (
            <h3 className="text-xl font-bold mt-4 mb-2" {...props}>
              {children}
            </h3>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h4: ({ children, node: _, ...props }) => {
          return (
            <h4 className="text-lg font-bold mt-4 mb-2" {...props}>
              {children}
            </h4>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h5: ({ children, node: _, ...props }) => {
          return (
            <h5 className="text-base font-bold mt-4 mb-2" {...props}>
              {children}
            </h5>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h6: ({ children, node: _, ...props }) => {
          return (
            <h6 className="text-sm font-bold mt-4 mb-2" {...props}>
              {children}
            </h6>
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        a: ({ children, node: _, ...props }) => {
          return (
            <Link
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {children}
            </Link>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
