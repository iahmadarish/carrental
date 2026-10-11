"use client";

export default function RetryPanel({ message, onRetry, retryLabel = "Try again" }) {
  return (
    <div className="col-span-full rounded-3xl border border-dashed border-line-2 bg-ink-2/40 p-10 text-center sm:p-16">
      <p className="mx-auto max-w-md text-mute">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost mt-6" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
