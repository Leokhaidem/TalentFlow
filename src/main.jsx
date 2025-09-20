import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { worker } from "./lib/msw";
import "./index.css";
import App from "./App.jsx";
async function enableMocks() {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    console.log("🔧 Mock Service Worker started");
  }
}
enableMocks().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
