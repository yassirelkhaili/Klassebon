import React from "react";
import ReactDOM from "react-dom/client";
import { API_PREFIX } from "@klassebon/shared";
import App from "./App";
import "./index.css";

console.log("API prefix from shared:", API_PREFIX);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
