import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { worker } from "./lib/msw";
import { db } from "./lib/database";
import "./index.css";
import App from "./App.jsx";

async function initializeApp() {
  await db.open();
  await db.seedData();
  console.log("🗄️ Database initialized");

  await new Promise(resolve => setTimeout(resolve, 100));

  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === "true") {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    console.log("🔧 Mock Service Worker started");
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error);
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
