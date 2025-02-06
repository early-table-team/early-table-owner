import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SSEProvider } from "./SSEProvider";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StoreManage from "./pages/StoreManage"
import StoreCreate from "./pages/StoreCreate"
import StoreUpdate from "./pages/StoreUpdate"
import StoreHours from "./pages/StoreHours"
import WaitingSetting from "./pages/WaitingSetting"


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
                <Route path="/store/manage" element={<StoreManage />} />
                <Route path="/store/create" element={<StoreCreate />} />
                <Route path="/store/update" element={<StoreUpdate />} />
                <Route path="/store/hours" element={<StoreHours />} />
                <Route path="/waiting/setting" element={<WaitingSetting />} />
              </Routes>
            // {/* </SSEProvider> */}
          }
        />
      </Routes>
    </Router>
  );
}


export default App;
