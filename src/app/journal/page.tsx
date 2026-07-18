import type { Metadata } from "next";

import { ModulePlaceholder } from "@/widgets/module-placeholder/module-placeholder";

export const metadata: Metadata = {
  title: "Journal",
};

export default function Page() {
  return <ModulePlaceholder href="/journal" />;
}
