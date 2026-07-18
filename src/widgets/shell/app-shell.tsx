import * as React from "react";

import { CommandCenter } from "@/widgets/command-center";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** Root layout chrome: sidebar rail + topbar + scrollable content well. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="px-6 py-6 lg:px-10 lg:py-8">{children}</main>
      </div>
      <CommandCenter />
    </div>
  );
}
