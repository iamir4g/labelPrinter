import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TemplatesPage from "@/pages/Templates";
import EditorPage from "@/pages/Editor";
import HomeRedirect from "@/pages/HomeRedirect";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:templateId" element={<EditorPage />} />
      </Routes>
    </Router>
  );
}
