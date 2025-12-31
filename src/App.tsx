import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Overlay from "./components/Overlay";

export default function App() {
  const [isOverlay, setIsOverlay] = useState(false);

  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.has("overlay")) {
      setIsOverlay(true);
      document.body.style.background = "transparent"; // Ensure body is transparent for overlay
    }
  }, []);

  return isOverlay ? <Overlay /> : <Dashboard />;
}

