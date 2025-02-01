import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import "./css/Login.css"; // CSS 파일 불러오기
import instance from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 로그인 API 호출
      const response = await instance
        .post("/users/login", {
          email,
          password,
        })
        .catch((error) => {
          console.log(error);
        });

      const { accessToken } = response.data;

      // 로컬스토리지에 accessToken 저장
      localStorage.setItem("accessToken", accessToken);

      // Axios 인스턴스 기본 헤더 설정
      instance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      console.log("로그인 성공, 토큰:", accessToken);
      navigate("/home"); // 홈 페이지로 이동
    } catch (error) {
      console.log(error);
      alert("로그인 실패!");
      navigate("/login");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <img
            src={require("../assets/company-logo.png")}
            alt="Company Logo"
            className="login-image"
          />
          <h2 className="login-title">Early Table</h2>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <div className="login-button-group">
            <button type="submit" className="login-button">
              로그인
            </button>
            <Link to="/register" className="login-link">
              <button className="login-button">회원가입</button>
            </Link>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            비밀번호 찾기
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
