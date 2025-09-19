import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PropertyPage from "./pages/PropertyPage";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/property/:id" element={<PropertyPage />} />
      </Routes>
    </Layout>
  );
}

