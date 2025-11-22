import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import UploadView from "./views/UploadView";
import DetailsView from "./views/DetailsView";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden border-x border-gray-200">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadView />} />
          <Route path="/bill/:id" element={<DetailsView />} />
        </Routes>
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
