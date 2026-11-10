import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { AlertDrawer } from './components/layout/AlertDrawer';

import { OverviewPage } from './pages/OverviewPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { EcologicalGraphPage } from './pages/EcologicalGraphPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AlertsReportsPage } from './pages/AlertsReportsPage';
import { MethodologyPage } from './pages/MethodologyPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
          {/* Main Navigation Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Top Navigation Bar */}
            <TopNavbar />

            {/* Scrollable Page Canvas */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/70">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/monitoring" element={<MonitoringPage />} />
                  <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
                  <Route path="/dependency-graph" element={<EcologicalGraphPage />} />
                  <Route path="/simulator" element={<SimulatorPage />} />
                  <Route path="/alerts" element={<AlertsReportsPage />} />
                  <Route path="/methodology" element={<MethodologyPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>

          {/* Quick Alerts Slide-out Drawer */}
          <AlertDrawer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

