import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import React from "react";
import { SecretInput } from "@/app/secretInput";

function SettingsSheetContent() {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
        <SecretInput />
      </SheetHeader>
    </SheetContent>
  );
}

export function SettingsSheetButton({ className }: { className?: string }) {
  return (
    <Sheet>
      <SheetTrigger>
        <Settings className={className} />
      </SheetTrigger>
      <SettingsSheetContent />
    </Sheet>
  );
}
