import { currency } from "../constants";
import { DownloadIcon, RefreshIcon } from "./Icons";

function typeLabel(type) {
  return type === "lump_sum" ? "Lump Sum Work" : "Equipment Rental";
}

export function HistoryPanel({ quotations, loading, onRefresh, onDownload }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-rentzoo-ink">History</h2>
        <button type="button" className="icon-button h-9 gap-2" onClick={onRefresh}>
          <RefreshIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          Loading quotations...
        </div>
      ) : quotations.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          No quotations saved yet.
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map((quotation) => (
            <article
              key={quotation.id}
              className="rounded-lg border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-rentzoo-ink">{quotation.quotationNumber}</div>
                  <div className="mt-1 text-sm text-stone-700">{quotation.clientName}</div>
                  <div className="mt-1 text-xs font-semibold uppercase text-stone-500">
                    {typeLabel(quotation.quotationType)} | {quotation.quoteDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-stone-950">
                    {currency(quotation.finalTotal)}
                  </div>
                  <button
                    type="button"
                    className="icon-button mt-3 h-9 gap-2"
                    onClick={() => onDownload(quotation.id)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                    PDF
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
