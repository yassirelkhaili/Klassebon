import { useEffect, useState } from "react";
import type { HealthResponse } from "@klassebon/shared";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1 className="text-red-500">Klassebon</h1>
      <p>Vite frontend + workspace shared types.</p>
      {health && (
        <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </main>
  );
}
