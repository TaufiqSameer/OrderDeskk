import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import OrderPage from "./orderpage";
import PaymentPage from "./paymentpage";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar businessName="Your Shop" />
      <Routes>
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/payments" element={<PaymentPage />} />
        <Route path="/" element={<OrderPage />} />
      </Routes>
    </BrowserRouter>
  );
}