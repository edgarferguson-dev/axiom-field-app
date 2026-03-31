import { redirect } from "next/navigation";

export default function SessionIndexPage({
  params,
}: {
  params: { sessionId: string };
}) {
  redirect(`/session/${params.sessionId}/field-read`);
}
