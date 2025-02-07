import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SSEProvider } from "./SSEProvider";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StoreManage from "./pages/StoreManage";
import MenuManage from "./pages/MenuManage";
import ModifyMenu from "./pages/ModifyMenu";
import CreateMenu from "./pages/CreateMenu";
import ReviewManage from "./pages/ReviewManage";
import ReservationManage from "./pages/ReservationManage";
import ReservationDetails from "./pages/ReservationDetails";


function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Register & Login은 SSEProvider 없이 렌더링 */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* 🔹 SSEProvider를 적용할 나머지 페이지들 */}
        <Route
          path="/*"
          element={
            // <SSEProvider>
              <Routes>
                <Route path="/" element={<StoreManage />} />
                <Route path="/store-manage" element={<StoreManage />} />
                <Route path="/menu-manage" element={<MenuManage />} />
                <Route path="/menu-manage/:storeId/modify/:menuId" element={<ModifyMenu />} />
                <Route path="/menu-manage/:storeId/create" element={<CreateMenu />} />
                <Route path="/review-manage" element={<ReviewManage />} />
                <Route path="/reservation-manage" element={<ReservationManage />} />
                <Route path="/reservation" element={<ReservationDetails />} />
              </Routes>
            // {/* </SSEProvider> */}
          }
        />
      </Routes>
    </Router>
  );
}


export default App;
