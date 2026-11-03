export const fallbackEquipmentOptions = [
  {
    name: "JCB 3DX Backhoe Loader",
    category: "Backhoe Loader",
    defaultRate: 225000,
    defaultDurationUnit: "month"
  },
  {
    name: "JCB 2DX Backhoe Loader",
    category: "Backhoe Loader",
    defaultRate: 195000,
    defaultDurationUnit: "month"
  },
  {
    name: "Tractor (Hydraulic)",
    category: "Tractor",
    defaultRate: 115000,
    defaultDurationUnit: "month"
  },
  {
    name: "Road Roller (Vibrator)",
    category: "Compaction",
    defaultRate: 100000,
    defaultDurationUnit: "week"
  },
  {
    name: "Tipper/Dumper Truck",
    category: "Transportation",
    defaultRate: 8500,
    defaultDurationUnit: "day"
  },
  {
    name: "Mini Excavator",
    category: "Excavator",
    defaultRate: 12000,
    defaultDurationUnit: "day"
  },
  {
    name: "Crawler Excavator",
    category: "Excavator",
    defaultRate: 18000,
    defaultDurationUnit: "day"
  },
  {
    name: "Hitachi 200",
    category: "Excavator",
    defaultRate: 18000,
    defaultDurationUnit: "day"
  },
  {
    name: "Hitachi 135",
    category: "Excavator",
    defaultRate: 15000,
    defaultDurationUnit: "day"
  },
  {
    name: "Crane",
    category: "Lifting",
    defaultRate: 15000,
    defaultDurationUnit: "day"
  }
];

export const fallbackScopeOptions = [
  "Soil loading",
  "Transportation",
  "Land filling",
  "Leveling",
  "Compaction"
];

export const fallbackTerms = "";

export const fallbackLumpSum = {
  amount: "",
  quoteTitle: "",
  introText: "",
  scopeTitle: "",
  contractValueTitle: "",
  projectDurationTitle: "",
  paymentTermsTitle: "",
  termsTitle: "",
  projectDuration: "",
  workIncludes: "",
  executionNote: "",
  dieselNote: "",
  riskNote: ""
};

export const fallbackPdfSettings = {
  roadRollerNote: "",
  unlimitedTitle: "",
  allRatesNote: "",
  rentzooScopeTitle: "",
  rentzooScopeItems: "",
  clientScopeTitle: "",
  clientScopeItems: "",
  regardsText: ""
};

export function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function currency(value) {
  return `INR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(Number(value) || 0)}`;
}

export function indianNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function emptyPdfDetails() {
  return {
    commercialDescription: "",
    shiftDuration: "",
    period: "",
    rentalDuration: "",
    perTripCost: "",
    perDayCost: "",
    perWeekCost: "",
    perMonthCost: "",
    totalHoursPerMonth: "",
    amountForEachVehicle: ""
  };
}

export function newEquipmentRow(option = fallbackEquipmentOptions[0]) {
  const rate = option.defaultRate || 0;
  return {
    equipmentName: option.name,
    quantity: 1,
    duration: 1,
    durationUnit: option.defaultDurationUnit || "month",
    rate,
    ...emptyPdfDetails()
  };
}

export function equipmentPdfDefaults() {
  return emptyPdfDetails();
}

export function calculatePreview(form) {
  const isRental = form.quotationType === "equipment_rental";
  const subtotal = isRental
    ? form.equipmentItems.reduce((total, item) => {
        return (
          total +
          (Number(item.quantity) || 0) *
            (Number(item.duration) || 0) *
            (Number(item.rate) || 0)
        );
      }, 0)
    : Number(form.lumpSum.amount) || 0;

  const gstAmount = form.gst.enabled
    ? (subtotal * (Number(form.gst.percent) || 0)) / 100
    : 0;
  const finalTotal = subtotal + gstAmount;
  const advancePercent = Math.min(
    100,
    Math.max(0, Number(form.paymentTerms.advancePercent) || 0)
  );
  const advanceAmount = (finalTotal * advancePercent) / 100;

  return {
    subtotal,
    gstAmount,
    finalTotal,
    advancePercent,
    balancePercent: 100 - advancePercent,
    advanceAmount,
    balanceAmount: finalTotal - advanceAmount
  };
}
