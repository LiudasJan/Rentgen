import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log("✅ index.tsx");

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
