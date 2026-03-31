import Link from "next/link";

export default function DispositionPage({ params }: any) {
  return (
    <div>
      <h1>Disposition</h1>

      <Link href={`/session/${params.sessionId}/recap`}>
        <button>Next → Recap</button>
      </Link>
    </div>
  );
}