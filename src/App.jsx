import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Swipe from "./pages/Swipe";

export default function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}></Route>
        <Route path="/auth" element={<Auth/>}></Route>
        <Route path="/swipe" element={<Swipe/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}