export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

export function Section({ title, aside, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-stone-200 bg-white p-5 shadow-panel ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-rentzoo-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
