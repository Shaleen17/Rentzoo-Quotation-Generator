const { EQUIPMENT_OPTIONS } = require("../company");
const { amountToWords } = require("./numberToWords");

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function clampPercent(value) {
  return Math.min(100, Math.max(0, asNumber(value, 0)));
}

function getEquipmentDefault(name) {
  return EQUIPMENT_OPTIONS.find((item) => item.name === name) || EQUIPMENT_OPTIONS[0];
}

function normalizeEquipmentItem(item) {
  const selected = getEquipmentDefault(item.equipmentName);
  const quantity = asNumber(item.quantity, 0);
  const duration = asNumber(item.duration, 0);
  const rate = asNumber(item.rate, selected.defaultRate);
  const durationUnit = item.durationUnit || selected.defaultDurationUnit;
  const amount = roundMoney(quantity * duration * rate);

  return {
    equipmentName: item.equipmentName || selected.name,
    quantity,
    duration,
    durationUnit,
    rate,
    amount,
    commercialDescription: String(item.commercialDescription || "").trim(),
    shiftDuration: String(item.shiftDuration || "").trim(),
    period: String(item.period || "").trim(),
    rentalDuration: String(item.rentalDuration || "").trim(),
    perTripCost: String(item.perTripCost || "").trim(),
    perDayCost: String(item.perDayCost || "").trim(),
    perWeekCost: String(item.perWeekCost || "").trim(),
    perMonthCost: String(item.perMonthCost || "").trim(),
    totalHoursPerMonth: String(item.totalHoursPerMonth || "").trim(),
    amountForEachVehicle: String(item.amountForEachVehicle || "").trim()
  };
}

function calculateQuotation(payload) {
  const quotationType =
    payload.quotationType === "lump_sum" ? "lump_sum" : "equipment_rental";

  let equipmentItems = [];
  let lumpSumAmount = 0;
  let subtotal = 0;

  if (quotationType === "equipment_rental") {
    equipmentItems = (payload.equipmentItems || [])
      .map(normalizeEquipmentItem)
      .filter((item) => item.quantity > 0 && item.duration > 0 && item.rate >= 0);

    if (equipmentItems.length === 0) {
      const error = new Error("At least one valid equipment row is required.");
      error.status = 400;
      throw error;
    }

    subtotal = roundMoney(
      equipmentItems.reduce((total, item) => total + item.amount, 0)
    );
  } else {
    lumpSumAmount = roundMoney(asNumber(payload.lumpSum?.amount, 0));
    subtotal = lumpSumAmount;
  }

  const gstEnabled = Boolean(payload.gst?.enabled);
  const gstPercent = gstEnabled ? clampPercent(payload.gst?.percent || 18) : 0;
  const gstAmount = roundMoney((subtotal * gstPercent) / 100);
  const finalTotal = roundMoney(subtotal + gstAmount);

  const advancePercent = clampPercent(payload.paymentTerms?.advancePercent ?? 50);
  const balancePercent = roundMoney(100 - advancePercent);
  const advanceAmount = roundMoney((finalTotal * advancePercent) / 100);
  const balanceAmount = roundMoney(finalTotal - advanceAmount);

  return {
    quotationType,
    equipmentItems,
    lumpSumAmount,
    subtotal,
    gstEnabled,
    gstPercent,
    gstAmount,
    totalAmount: subtotal,
    finalTotal,
    amountInWords: amountToWords(finalTotal),
    paymentTerms: {
      advancePercent,
      balancePercent,
      advanceAmount,
      balanceAmount
    }
  };
}

module.exports = {
  calculateQuotation,
  roundMoney
};
