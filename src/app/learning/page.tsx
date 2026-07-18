import type { Metadata } from "next";

import { ModulePlaceholder } from "@/widgets/module-placeholder/module-placeholder";

export const metadata: Metadata = {
  title: "Learning Hub",
};

export default function Page() {
  return <ModulePlaceholder href="/learning" />;
}
