import type { Metadata } from "next";

import { ModulePlaceholder } from "@/widgets/module-placeholder/module-placeholder";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return <ModulePlaceholder href="/settings" />;
}
