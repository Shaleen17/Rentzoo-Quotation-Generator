import { currency, equipmentPdfDefaults, indianNumber, newEquipmentRow } from "../constants";
import { PlusIcon, TrashIcon } from "./Icons";

const durationUnits = ["day", "week", "month"];

export function EquipmentTable({ items, options, onChange }) {
  function updateRow(index, patch) {
    const next = items.map((item, rowIndex) => {
      if (rowIndex !== index) {
        return item;
      }

      if (patch.equipmentName) {
        const selected = options.find((option) => option.name === patch.equipmentName);
        const rate = selected?.defaultRate ?? item.rate;
        return {
          ...item,
          ...patch,
          rate,
          durationUnit: selected?.defaultDurationUnit ?? item.durationUnit,
          ...equipmentPdfDefaults(patch.equipmentName, rate)
        };
      }

      if (Object.prototype.hasOwnProperty.call(patch, "rate")) {
        const formattedRate = `${indianNumber(patch.rate)}/-`;
        return {
          ...item,
          ...patch,
          perMonthCost: item.perMonthCost ? formattedRate : "",
          amountForEachVehicle: item.amountForEachVehicle ? formattedRate : ""
        };
      }

      return {
        ...item,
        ...patch
      };
    });

    onChange(next);
  }

  function addRow() {
    onChange([...items, newEquipmentRow(options[0])]);
  }

  function removeRow(index) {
    onChange(items.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-stone-500">
              <th className="w-[260px] border-b border-stone-200 pb-2 pr-3">Equipment</th>
              <th className="w-[96px] border-b border-stone-200 pb-2 pr-3">Qty</th>
              <th className="w-[132px] border-b border-stone-200 pb-2 pr-3">Duration</th>
              <th className="w-[120px] border-b border-stone-200 pb-2 pr-3">Unit</th>
              <th className="w-[160px] border-b border-stone-200 pb-2 pr-3">Rate</th>
              <th className="w-[160px] border-b border-stone-200 pb-2 pr-3 text-right">Amount</th>
              <th className="w-[60px] border-b border-stone-200 pb-2 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const amount =
                (Number(item.quantity) || 0) *
                (Number(item.duration) || 0) *
                (Number(item.rate) || 0);

              return (
                <tr key={`${item.equipmentName}-${index}`}>
                  <td className="py-3 pr-3">
                    <select
                      className="input-base"
                      value={item.equipmentName}
                      onChange={(event) => updateRow(index, { equipmentName: event.target.value })}
                    >
                      {options.map((option) => (
                        <option key={option.name} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      className="input-base"
                      min="0"
                      step="1"
                      type="number"
                      value={item.quantity}
                      onChange={(event) => updateRow(index, { quantity: event.target.value })}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      className="input-base"
                      min="0"
                      step="1"
                      type="number"
                      value={item.duration}
                      onChange={(event) => updateRow(index, { duration: event.target.value })}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      className="input-base"
                      value={item.durationUnit}
                      onChange={(event) => updateRow(index, { durationUnit: event.target.value })}
                    >
                      {durationUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      className="input-base"
                      min="0"
                      step="100"
                      type="number"
                      value={item.rate}
                      onChange={(event) => updateRow(index, { rate: event.target.value })}
                    />
                  </td>
                  <td className="py-3 pr-3 text-right font-bold text-rentzoo-ink">
                    {currency(amount)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      className="icon-button h-10 w-10 px-0"
                      onClick={() => removeRow(index)}
                      title="Remove row"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`pdf-details-${item.equipmentName}-${index}`} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-rentzoo-ink">
                PDF Details: {item.equipmentName || `Equipment ${index + 1}`}
              </h3>
              <span className="text-xs font-semibold uppercase text-stone-500">
                Rate table values
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block md:col-span-2">
                <span className="field-label">Commercial Description</span>
                <textarea
                  className="input-base min-h-20 resize-y"
                  value={item.commercialDescription || ""}
                  onChange={(event) =>
                    updateRow(index, { commercialDescription: event.target.value })
                  }
                />
              </label>

              <label className="block">
                <span className="field-label">Shift Duration</span>
                <input
                  className="input-base"
                  value={item.shiftDuration || ""}
                  onChange={(event) => updateRow(index, { shiftDuration: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="field-label">Period</span>
                <input
                  className="input-base"
                  value={item.period || ""}
                  onChange={(event) => updateRow(index, { period: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="field-label">Rental Duration</span>
                <input
                  className="input-base"
                  value={item.rentalDuration || ""}
                  onChange={(event) => updateRow(index, { rentalDuration: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="field-label">Per trip / hour cost</span>
                <input
                  className="input-base"
                  value={item.perTripCost || ""}
                  onChange={(event) => updateRow(index, { perTripCost: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="field-label">Per day cost</span>
                <input
                  className="input-base"
                  value={item.perDayCost || ""}
                  onChange={(event) => updateRow(index, { perDayCost: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="field-label">Per week cost</span>
                <textarea
                  className="input-base min-h-20 resize-y"
                  value={item.perWeekCost || ""}
                  onChange={(event) => updateRow(index, { perWeekCost: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="field-label">Per month cost per unit</span>
                <input
                  className="input-base"
                  value={item.perMonthCost || ""}
                  onChange={(event) => updateRow(index, { perMonthCost: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="field-label">Total hours per month</span>
                <textarea
                  className="input-base min-h-20 resize-y"
                  value={item.totalHoursPerMonth || ""}
                  onChange={(event) =>
                    updateRow(index, { totalHoursPerMonth: event.target.value })
                  }
                />
              </label>

              <label className="block">
                <span className="field-label">Amount for each vehicle</span>
                <input
                  className="input-base"
                  value={item.amountForEachVehicle || ""}
                  onChange={(event) =>
                    updateRow(index, { amountForEachVehicle: event.target.value })
                  }
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="icon-button gap-2" onClick={addRow}>
        <PlusIcon className="h-4 w-4" />
        Add Equipment
      </button>
    </div>
  );
}
