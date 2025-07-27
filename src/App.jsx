import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Athletes from "@/components/pages/Athletes";
import AthleteProfile from "@/components/pages/AthleteProfile";
import Performance from "@/components/pages/Performance";
import Training from "@/components/pages/Training";
import Health from "@/components/pages/Health";
function App() {
  return (
    <>
<Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/athletes" replace />} />
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/athletes/:id" element={<AthleteProfile />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/training" element={<Training />} />
          <Route path="/health" element={<Health />} />
        </Route>
      </Routes>
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