import React from "react";
import ReactDOM from "react-dom/client";
import { Suspense } from "react";
import App from "./App";
import "./index.css";

// Use React.lazy for the main app component
const LazyApp = React.lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <LazyApp />
    </Suspense>
  </React.StrictMode>
);