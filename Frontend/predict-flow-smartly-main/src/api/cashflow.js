export const getDashboard        = () => API.get("/api/dashboard");
export const getInflowVsOutflow  = () => API.get("/api/inflow-vs-outflow");
export const getOutflowBreakdown = () => API.get("/api/outflow-breakdown");
export const getTransactions     = () => API.get("/api/transactions");
export const processPDF          = () => API.post("/api/process-pdf");