import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import RiskAssessment from "@/components/pages/RiskAssessment";
import React from "react";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import Performance from "@/components/pages/Performance";
import Athletes from "@/components/pages/Athletes";
import AthleteProfile from "@/components/pages/AthleteProfile";
import Health from "@/components/pages/Health";
import Training from "@/components/pages/Training";

function App() {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/athletes" replace />} />
            <Route path="/athletes" element={<Athletes />} />
            <Route path="/athletes/:id" element={<AthleteProfile />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/training" element={<Training />} />
            <Route path="/health" element={<Health />} />
            <Route path="/risk-assessment" element={<RiskAssessment />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  );
}

export default App;