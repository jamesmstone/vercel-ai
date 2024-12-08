import Chat from "@/app/chat";
import React from "react";
import { SettingsSheetButton } from "@/components/custom/settings-sheet";

export default function Home() {
  return (
    <>
      <main className="flex justify-center p-4 md:p-8 lg:p-12">
        <Chat className={"w-full max-w-3xl"} />
      </main>
      <SettingsSheetButton
        className={"fixed top-2 right-2 md:top-4 md:right-4"}
      />
    </>
  );
}
