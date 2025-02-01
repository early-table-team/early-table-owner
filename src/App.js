import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SSEProvider } from "./SSEProvider";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home"


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
            <SSEProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
              </Routes>
            </SSEProvider>
          }
        />
      </Routes>
    </Router>
  );
}


export default App;
