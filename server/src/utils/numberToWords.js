const BELOW_TWENTY = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen"
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety"
];

function titleCase(value) {
  return value.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function convertBelowHundred(value) {
  if (value < 20) {
    return BELOW_TWENTY[value];
  }

  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return [TENS[tens], BELOW_TWENTY[ones]].filter(Boolean).join(" ");
}

function convertNumber(value) {
  if (value === 0) {
    return "zero";
  }

  if (value < 100) {
    return convertBelowHundred(value);
  }

  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    return [
      `${BELOW_TWENTY[hundreds]} hundred`,
      rest ? convertBelowHundred(rest) : ""
    ]
      .filter(Boolean)
      .join(" ");
  }

  const units = [
    [10000000, "crore"],
    [100000, "lakh"],
    [1000, "thousand"]
  ];

  for (const [size, label] of units) {
    if (value >= size) {
      const major = Math.floor(value / size);
      const rest = value % size;
      return [
        `${convertNumber(major)} ${label}`,
        rest ? convertNumber(rest) : ""
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  return "";
}

function amountToWords(amount) {
  const rupees = Math.round(Number(amount) || 0);
  return `Rupees ${titleCase(convertNumber(rupees))} Only`;
}

module.exports = {
  amountToWords
};
