import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Swipe from "./pages/Swipe";
import FarmerDashboard from "./pages/FarmerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}></Route>
        <Route path="/auth" element={<Auth/>}></Route>
        <Route path="/swipe" element={
          <ProtectedRoute allowedRoles={['consumer']}>
            <Swipe/>
          </ProtectedRoute>
        }></Route>
        <Route path="/farmer-dashboard" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard/>
          </ProtectedRoute>
        }></Route>
      </Routes>
    </BrowserRouter>
  )
}