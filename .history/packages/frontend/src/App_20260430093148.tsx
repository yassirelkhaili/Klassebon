import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/shared/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Expenses } from "./pages/Expenses";
import { Subscriptions } from "./pages/Subscriptions";
import { AiTips } from "./pages/AiTips";

export default function App() {
  return (
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
  );
}
