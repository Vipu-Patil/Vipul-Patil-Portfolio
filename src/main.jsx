import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Enables scroll-reveal styles only when JavaScript runs.
document.documentElement.classList.add("js-anim");

createRoot(document.getElementById("root")).render(<App />);
