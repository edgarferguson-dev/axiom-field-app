/** Route segment loading fallback — keeps layout from flashing blank during suspense. */
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
    </div>
  );
}
