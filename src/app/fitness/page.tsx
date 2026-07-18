import type { Metadata } from "next";

import { ModulePlaceholder } from "@/widgets/module-placeholder/module-placeholder";

export const metadata: Metadata = {
  title: "Fitness",
};

export default function Page() {
  return <ModulePlaceholder href="/fitness" />;
}
