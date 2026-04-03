import { notFound } from "next/navigation";
import { DevResetClient } from "./ResetClient";

/** Development-only: clear persisted Zustand state and reload. Not included in typical navigation. */
export default function DevResetSessionPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  return <DevResetClient />;
}
