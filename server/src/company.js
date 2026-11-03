const COMPANY_DETAILS = {
  name: "RENTZOO PRIVATE LIMITED",
  cin: "CIN-U77303TS2026PTC211671",
  registeredOffice:
    "Registered Office: 12-9-35/36, Raghavendra Colony, Khaitalapur, Moosapet, Kukatpally, Hyderabad - 500018",
  phone: "Phone: +91 7013708828",
  email: "Email: Founder@rentzoo.in",
  website: "Website: www.Rentzoo.in",
  branchOffice:
    "345 RAGAVENDRA WELFARE, Moosapet, K.V.Rangareddy, Balanagar, Telangana, India, 500018."
};

const EQUIPMENT_OPTIONS = [
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

const SCOPE_OPTIONS = [
  "Soil loading",
  "Transportation",
  "Land filling",
  "Leveling",
  "Compaction"
];

const DEFAULT_TERMS = [
  "Soil source and filling area are already identified and approved by the client",
  "Work will be executed as per site instructions and agreed levels.",
  "Rentzoo will manage all resources, transportation, and execution",
  "Any additional work beyond the agreed scope will be charged separately.",
  "Delay due to weather or unavoidable site conditions will be considered accordingly"
].join("\n");

const DEFAULT_LUMP_SUM = {
  amount: 1200000,
  quoteTitle: "QUOTATION: HEAVY EQUIPMENT RENTAL",
  introText:
    "With reference to the site discussion and inspection, we hereby submit our quotation for land filling and leveling work at your site",
  scopeTitle: "Scope of work",
  contractValueTitle: "Contract Value",
  projectDurationTitle: "Project Duration",
  paymentTermsTitle: "Payment Terms",
  termsTitle: "Terms & Conditions",
  projectDuration: "within 1 Month from the date of work order / site handover",
  workIncludes:
    "Filling of land with suitable earth/material Leveling and compaction of the filled area Achieving required formation level as per client instructions",
  executionNote:
    "Note: The method, machinery, manpower, and execution strategy will be solely decided by the Rentzoo.",
  dieselNote:
    "IN THIS 12-LAKH PROJECT, THE ROAD ROLLER WILL REMAIN ON SITE UNTIL THE WORK IS COMPLETED. RENTZOO WILL HANDLE THE DIESEL USAGE (AT A RATE OF 10 LITERS PER HOUR). THEREFORE, IF THE WORK LASTS BETWEEN 40 TO 50 HOURS, THE DIESEL COST WILL TOTAL ₹ 60,000.",
  riskNote:
    "All risks are handled by rentzoo except Natural calamities like extreme, sudden events caused by environmental forces--such as earthquakes, floods, hurricanes, and wildfires"
};

const DEFAULT_PDF_SETTINGS = {
  roadRollerNote: "NOTE: ROAD ROLLER CONSUMES 10 LITERS PER HOUR",
  unlimitedTitle: "Total If we go with unlimited:",
  allRatesNote:
    "All rates are all-inclusive (Diesel, Operator, Maintenance, and Rentzoo Service Fee).",
  rentzooScopeTitle: "Scope of Service (Rentzoo Responsibility)",
  rentzooScopeItems: [
    "Diesel & Lubricants: All fuel and oil requirements are included in the fixed monthly rate.",
    "Manpower: Qualified operators for JCBs and experienced drivers for Tractors will be provided from rentzoo..",
    "Maintenance: Comprehensive coverage (Both Minor & Major). Rentzoo will ensure 95% uptime.",
    "Compliance: All vehicles will have valid insurance, RC, and fitness certificates as per RTO norms.",
    "Provision: Diesel, oiling, greasing, food for drivers will be taken care of rentzoo."
  ].join("\n"),
  clientScopeTitle: "Client Scope (University Responsibility)",
  clientScopeItems: [
    "Safe parking/yard space for the fleet.",
    "Site supervisor for daily task allocation.",
    "Timely payment processing at the end of the 1-month tenure.",
    "50 Percent should be released after the mobilization of the vechiles to the site."
  ].join("\n"),
  regardsText: "With Regards,\nTeam Rentzoo"
};

module.exports = {
  COMPANY_DETAILS,
  DEFAULT_LUMP_SUM,
  DEFAULT_PDF_SETTINGS,
  EQUIPMENT_OPTIONS,
  SCOPE_OPTIONS,
  DEFAULT_TERMS
};
