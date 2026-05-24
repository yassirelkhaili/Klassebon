import React from "react";
import ReactDOM from "react-dom/client";
<<<<<<< HEAD
import App from "./App";
import "./index.css";

=======
import { api_prefix } from "@klassebon/shared";
import App from "./App";
import "./index.css";

console.log("API prefix from shared:", api_prefix);

>>>>>>> master
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
