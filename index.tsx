import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./views/Dashboard";
import UploadView from "./views/UploadView";
import DetailsView from "./views/DetailsView";
import { AppState, ViewState } from "./types";

const App = () => {
  const [state, setState] = useState<AppState>({ view: 'dashboard' });

  const navigate = (view: ViewState, id?: string) => {
    setState({ view, selectedBillId: id });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden border-x border-gray-200">
        {state.view === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {state.view === 'upload' && <UploadView onBack={() => navigate('dashboard')} />}
        {state.view === 'details' && state.selectedBillId && (
          <DetailsView id={state.selectedBillId} onBack={() => navigate('dashboard')} />
        )}
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}