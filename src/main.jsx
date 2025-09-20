import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { worker } from "./lib/msw";
import { db } from "./lib/database";
import "./index.css";
import App from "./App.jsx";

async function initializeApp() {
  // Initialize database first
  await db.open();
  await db.seedData();
  console.log("🗄️ Database initialized");

  // Small delay to ensure database is fully ready
  await new Promise(resolve => setTimeout(resolve, 100));

  // Then start MSW
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === "true") {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    console.log("🔧 Mock Service Worker started");
  }

  // Finally render the app
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Start the app initialization
initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error);
  // Fallback: render app even if initialization fails
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
