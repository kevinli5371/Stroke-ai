import { useEffect, useState } from "react";
import "../styles/bubble.css";

function Bubble() {
  const [combo, setCombo] = useState<string | undefined>();

  useEffect(() => {
    // existing listeners / logic...
  }, [combo]);

  return (
    <div className="bubble-container">
      <div className="bubble">
        <p>{combo ?? "…"}</p>
      </div>
    </div>
  );
}

export default Bubble;