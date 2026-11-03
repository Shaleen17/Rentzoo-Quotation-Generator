import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import {
  calculatePreview,
  fallbackLumpSum,
  fallbackEquipmentOptions,
  fallbackPdfSettings,
  fallbackScopeOptions,
  fallbackTerms,
  newEquipmentRow,
  todayInputValue
} from "./constants";
import { EquipmentTable } from "./components/EquipmentTable";
import { Field, Section } from "./components/Field";
import { HistoryPanel } from "./components/HistoryPanel";
import { SaveIcon } from "./components/Icons";
import { ScopeSelector } from "./components/ScopeSelector";
import { TotalsPanel } from "./components/TotalsPanel";

function createInitialForm(equipmentOptions = fallbackEquipmentOptions, terms = fallbackTerms) {
  return {
    clientName: "",
    projectLocation: "",
    quoteDate: todayInputValue(),
    quotationType: "equipment_rental",
    equipmentItems: [newEquipmentRow(equipmentOptions[0])],
    lumpSum: { ...fallbackLumpSum },
    scopeOfWork: {
      selected: [],
      custom: ""
    },
    paymentTerms: {
      advancePercent: ""
    },
    gst: {
      enabled: false,
      percent: 18
    },
    pdfSettings: { ...fallbackPdfSettings },
    termsAndConditions: terms
  };
}

function validateForm(form) {
  const errors = {};

  if (form.quotationType === "equipment_rental") {
    const validRows = form.equipmentItems.filter((item) => {
      return (
        item.equipmentName &&
        Number(item.quantity) > 0 &&
        Number(item.duration) > 0 &&
        Number(item.rate) >= 0
      );
    });

    if (validRows.length === 0) {
      errors.equipment = "Add at least one valid equipment row.";
    }
  }

  return errors;
}

function Status({ status }) {
  if (!status) {
    return null;
  }

  const isError = status.type === "error";
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {status.message}
    </div>
  );
}

function App() {
  const [equipmentOptions, setEquipmentOptions] = useState(fallbackEquipmentOptions);
  const [scopeOptions, setScopeOptions] = useState(fallbackScopeOptions);
  const [form, setForm] = useState(() => createInitialForm());
  const [quotations, setQuotations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const totals = useMemo(() => calculatePreview(form), [form]);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await api.listQuotations();
      setQuotations(data.quotations || []);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    async function loadOptions() {
      try {
        const data = await api.getOptions();
        const nextEquipment = data.equipmentOptions?.length
          ? data.equipmentOptions
          : fallbackEquipmentOptions;
        setEquipmentOptions(nextEquipment);
        setScopeOptions(data.scopeOptions?.length ? data.scopeOptions : fallbackScopeOptions);
        setForm((current) => ({
          ...current,
          lumpSum: current.lumpSum,
          pdfSettings: current.pdfSettings,
          termsAndConditions: current.termsAndConditions
        }));
      } catch (error) {
        setStatus({ type: "error", message: error.message });
      }
    }

    loadOptions();
    loadHistory();
  }, []);

  function updateForm(patch) {
    setForm((current) => ({
      ...current,
      ...patch
    }));
  }

  function downloadPdf(id) {
    window.open(api.pdfUrl(id), "_blank", "noopener,noreferrer");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setSaving(true);
    try {
      const response = await api.createQuotation(form);
      setStatus({
        type: "success",
        message: `Saved ${response.quotation.quotationNumber}.`
      });
      await loadHistory();
      downloadPdf(response.quotation.id);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen text-stone-950">
      <header className="border-b border-rentzoo-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-black text-rentzoo-ink sm:text-3xl">
              Rentzoo Quotation Generator
            </h1>
            <p className="mt-1 text-sm font-semibold text-stone-600">
              RENTZOO PRIVATE LIMITED | CIN-U77303TS2026PTC211671
            </p>
          </div>
          <div className="rounded-lg border border-rentzoo-teal/20 bg-rentzoo-mint px-4 py-3 text-sm font-semibold text-rentzoo-ink">
            Founder@rentzoo.in | +91 7013708828
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Status status={status} />

          <Section title="Quotation Details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Client Name" error={errors.clientName}>
                <input
                  className="input-base"
                  value={form.clientName}
                  onChange={(event) => updateForm({ clientName: event.target.value })}
                />
              </Field>

              <Field label="Project Location" error={errors.projectLocation}>
                <input
                  className="input-base"
                  value={form.projectLocation}
                  onChange={(event) => updateForm({ projectLocation: event.target.value })}
                />
              </Field>

              <Field label="Date">
                <input
                  className="input-base"
                  type="date"
                  value={form.quoteDate}
                  onChange={(event) => updateForm({ quoteDate: event.target.value })}
                />
              </Field>

              <div>
                <span className="mb-2 block text-lg font-bold text-stone-700">
                  Quotation Type
                </span>
                <div className="grid grid-cols-2 rounded-lg border border-stone-300 bg-white p-2">
                  {[
                    ["equipment_rental", "Equipment Rental"],
                    ["lump_sum", "Lump Sum Work"]
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={form.quotationType === value}
                      className={`min-h-14 rounded-lg px-3 py-2 text-lg font-extrabold transition ${
                        form.quotationType === value
                          ? "bg-rentzoo-ink text-white"
                          : "text-stone-700 hover:bg-rentzoo-mint"
                      }`}
                      onClick={() => updateForm({ quotationType: value })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {form.quotationType === "equipment_rental" ? (
            <Section title="Equipment">
              <>
                <EquipmentTable
                  items={form.equipmentItems}
                  options={equipmentOptions}
                  onChange={(equipmentItems) => updateForm({ equipmentItems })}
                />
                {errors.equipment ? (
                  <div className="mt-2 text-sm font-semibold text-red-600">{errors.equipment}</div>
                ) : null}
              </>
            </Section>
          ) : null}

          <Section title="Lump Sum Work Details">
            <div className="grid gap-4 md:grid-cols-2">
              {form.quotationType === "lump_sum" ? (
                <>
                  <Field label="PDF Title" className="md:col-span-2">
                    <input
                      className="input-base"
                      value={form.lumpSum.quoteTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            quoteTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Intro Line" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-20 resize-y"
                      value={form.lumpSum.introText || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            introText: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Scope Section Title">
                    <input
                      className="input-base"
                      value={form.lumpSum.scopeTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            scopeTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Contract Section Title">
                    <input
                      className="input-base"
                      value={form.lumpSum.contractValueTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            contractValueTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Duration Section Title">
                    <input
                      className="input-base"
                      value={form.lumpSum.projectDurationTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            projectDurationTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Payment Section Title">
                    <input
                      className="input-base"
                      value={form.lumpSum.paymentTermsTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            paymentTermsTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Terms Section Title" className="md:col-span-2">
                    <input
                      className="input-base"
                      value={form.lumpSum.termsTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            termsTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>
                </>
              ) : null}

              <Field label="Lump Sum Cost" error={errors.lumpSum}>
                <input
                  className="input-base"
                  min="0"
                  step="1000"
                  type="number"
                  value={form.lumpSum.amount}
                  onChange={(event) =>
                    updateForm({
                      lumpSum: {
                        ...form.lumpSum,
                        amount: event.target.value
                      }
                    })
                  }
                />
              </Field>

              <Field label="Project Duration">
                <input
                  className="input-base"
                  value={form.lumpSum.projectDuration || ""}
                  onChange={(event) =>
                    updateForm({
                      lumpSum: {
                        ...form.lumpSum,
                        projectDuration: event.target.value
                      }
                    })
                  }
                />
              </Field>

              {form.quotationType === "equipment_rental" ? (
                <>
                  <Field label="Work Includes" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-24 resize-y"
                      value={form.lumpSum.workIncludes || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            workIncludes: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Execution Note" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-20 resize-y"
                      value={form.lumpSum.executionNote || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            executionNote: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Diesel / Road Roller Note" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-24 resize-y"
                      value={form.lumpSum.dieselNote || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            dieselNote: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Risk Note" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-20 resize-y"
                      value={form.lumpSum.riskNote || ""}
                      onChange={(event) =>
                        updateForm({
                          lumpSum: {
                            ...form.lumpSum,
                            riskNote: event.target.value
                          }
                        })
                      }
                    />
                  </Field>
                </>
              ) : null}
            </div>
          </Section>

          <Section title="PDF Notes & Responsibility Text">
            <div className="grid gap-4 md:grid-cols-2">
              {form.quotationType === "equipment_rental" ? (
                <>
                  <Field label="Road Roller Note">
                    <input
                      className="input-base"
                      value={form.pdfSettings.roadRollerNote || ""}
                      onChange={(event) =>
                        updateForm({
                          pdfSettings: {
                            ...form.pdfSettings,
                            roadRollerNote: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Total Section Heading">
                    <input
                      className="input-base"
                      value={form.pdfSettings.unlimitedTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          pdfSettings: {
                            ...form.pdfSettings,
                            unlimitedTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="All Inclusive Note" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-20 resize-y"
                      value={form.pdfSettings.allRatesNote || ""}
                      onChange={(event) =>
                        updateForm({
                          pdfSettings: {
                            ...form.pdfSettings,
                            allRatesNote: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Rentzoo Scope Title">
                    <input
                      className="input-base"
                      value={form.pdfSettings.rentzooScopeTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          pdfSettings: {
                            ...form.pdfSettings,
                            rentzooScopeTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Client Scope Title">
                    <input
                      className="input-base"
                      value={form.pdfSettings.clientScopeTitle || ""}
                      onChange={(event) =>
                        updateForm({
                          pdfSettings: {
                            ...form.pdfSettings,
                            clientScopeTitle: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Rentzoo Scope Items" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-32 resize-y"
                      value={form.pdfSettings.rentzooScopeItems || ""}
                      onChange={(event) =>
                        updateForm({
                          pdfSettings: {
                            ...form.pdfSettings,
                            rentzooScopeItems: event.target.value
                          }
                        })
                      }
                    />
                  </Field>

                  <Field label="Client Scope Items" className="md:col-span-2">
                    <textarea
                      className="input-base min-h-28 resize-y"
                      value={form.pdfSettings.clientScopeItems || ""}
                      onChange={(event) =>
                        updateForm({
                          pdfSettings: {
                            ...form.pdfSettings,
                            clientScopeItems: event.target.value
                          }
                        })
                      }
                    />
                  </Field>
                </>
              ) : null}

              <Field label="Regards Text" className="md:col-span-2">
                <textarea
                  className="input-base min-h-20 resize-y"
                  value={form.pdfSettings.regardsText || ""}
                  onChange={(event) =>
                    updateForm({
                      pdfSettings: {
                        ...form.pdfSettings,
                        regardsText: event.target.value
                      }
                    })
                  }
                />
              </Field>
            </div>
          </Section>

          <Section title="Scope of Work">
            <ScopeSelector
              options={scopeOptions}
              value={form.scopeOfWork}
              onChange={(scopeOfWork) => updateForm({ scopeOfWork })}
            />
          </Section>

          <Section title="Payment & Totals">
            <TotalsPanel
              totals={totals}
              gst={form.gst}
              paymentTerms={form.paymentTerms}
              onGstChange={(gst) => updateForm({ gst })}
              onPaymentChange={(paymentTerms) => updateForm({ paymentTerms })}
            />
          </Section>

          <Section title="Terms & Conditions">
            <textarea
              className="input-base min-h-40 resize-y"
              value={form.termsAndConditions}
              onChange={(event) => updateForm({ termsAndConditions: event.target.value })}
            />
          </Section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="submit" className="primary-button gap-2" disabled={saving}>
              <SaveIcon className="h-4 w-4" />
              {saving ? "Generating..." : "Generate PDF"}
            </button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-5 lg:self-start">
          <HistoryPanel
            quotations={quotations}
            loading={historyLoading}
            onRefresh={loadHistory}
            onDownload={downloadPdf}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
