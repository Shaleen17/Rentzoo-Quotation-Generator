export function ScopeSelector({ options, value, onChange }) {
  const selected = value.selected || [];

  function toggle(option) {
    const nextSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    onChange({
      ...value,
      selected: nextSelected
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-12 items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-800"
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-rentzoo-teal"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      <label className="block">
        <span className="field-label">Custom Scope</span>
        <textarea
          className="input-base min-h-24 resize-y"
          value={value.custom || ""}
          onChange={(event) => onChange({ ...value, custom: event.target.value })}
        />
      </label>
    </div>
  );
}
