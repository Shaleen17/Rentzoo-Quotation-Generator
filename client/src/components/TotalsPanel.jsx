import { currency } from "../constants";

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-200 py-2 last:border-b-0">
      <span className={strong ? "font-bold text-rentzoo-ink" : "text-stone-600"}>{label}</span>
      <span className={strong ? "font-extrabold text-rentzoo-ink" : "font-semibold text-stone-950"}>
        {value}
      </span>
    </div>
  );
}

export function TotalsPanel({ totals, gst, paymentTerms, onGstChange, onPaymentChange }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="flex min-h-12 items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm font-semibold text-stone-800">
          <input
            type="checkbox"
            className="h-4 w-4 accent-rentzoo-teal"
            checked={gst.enabled}
            onChange={(event) => onGstChange({ ...gst, enabled: event.target.checked })}
          />
          GST
        </label>
        <label className="block">
          <span className="field-label">GST %</span>
          <input
            className="input-base"
            min="0"
            max="100"
            step="0.01"
            type="number"
            value={gst.percent}
            onChange={(event) => onGstChange({ ...gst, percent: event.target.value })}
            disabled={!gst.enabled}
          />
        </label>
        <label className="block">
          <span className="field-label">Advance %</span>
          <input
            className="input-base"
            min="0"
            max="100"
            step="1"
            type="number"
            value={paymentTerms.advancePercent}
            onChange={(event) =>
              onPaymentChange({
                ...paymentTerms,
                advancePercent: event.target.value
              })
            }
          />
        </label>
        <label className="block">
          <span className="field-label">Balance %</span>
          <input className="input-base bg-stone-100" readOnly value={totals.balancePercent} />
        </label>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
        <Row label="Subtotal" value={currency(totals.subtotal)} />
        <Row label="GST" value={gst.enabled ? currency(totals.gstAmount) : "Not applied"} />
        <Row label="Final Total" value={currency(totals.finalTotal)} strong />
        <Row
          label={`Advance (${totals.advancePercent}%)`}
          value={currency(totals.advanceAmount)}
        />
        <Row
          label={`Balance (${totals.balancePercent}%)`}
          value={currency(totals.balanceAmount)}
        />
      </div>
    </div>
  );
}
