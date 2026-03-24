import React from "react";
import ReactDOM from "react-dom/client";
import DemoApp from "./DemoApp";
import { FlagProvider } from "./feature-flag-sdk";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <FlagProvider>
      <DemoApp />
    </FlagProvider>
  </React.StrictMode>
);