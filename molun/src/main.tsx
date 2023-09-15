import React from "react";
import { createRoot } from "react-dom/client";

import App from "./app";

import "./styles/normalize.css";
import "./styles/index.scss";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
