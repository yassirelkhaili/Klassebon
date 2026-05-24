import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/shared/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Expenses } from "./pages/Expenses";
import { Subscriptions } from "./pages/Subscriptions";
import { AiTips } from "./pages/AiTips";

export default function App() {
  return (
<<<<<<< HEAD
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/ai-tips" element={<AiTips />} />
        </Routes>
      </Layout>
    </BrowserRouter>
=======
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1 className="text-red-500">Klassebon</h1>
      <p>Vite frontend + workspace shared types.</p>
      {health && <pre style={{ background: "#f4f4f4", padding: "1rem" }}>{JSON.stringify(health, null, 2)}</pre>}
    </main>
>>>>>>> master
  );
}
