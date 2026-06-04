import axios from "axios";

const API = axios.create({
  baseURL: "https://cashflow-backend-xm62.onrender.com",
});

export default API;