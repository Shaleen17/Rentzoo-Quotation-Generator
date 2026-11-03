const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload?.message
        ? payload.message
        : "Request failed.";
    throw new Error(message);
  }

  return payload;
}

export const api = {
  getOptions() {
    return request("/api/equipment-options");
  },
  listQuotations() {
    return request("/api/quotations");
  },
  createQuotation(data) {
    return request("/api/quotations", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  pdfUrl(id) {
    return `${API_BASE}/api/quotations/${id}/pdf`;
  }
};
