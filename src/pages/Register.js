import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router의 useNavigate 훅 사용
import "./css/Register.css";
import instance from "../api/axios";

function Register() {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    phone: "",
    auth: "",
    profileImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profileImage: file });
      setImagePreview(URL.createObjectURL(file)); // 미리보기 업데이트
    }
  };

  const handlePreviewClick = () => {
    document.getElementById("profileImage").click(); // 프리뷰 클릭 시 파일 선택 창 띄우기
  };

  const validatePassword = () => {
    if (form.password !== form.confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("nickname", form.nickname);
    formData.append("phone", form.phone);
    formData.append("auth", form.auth);
    // 이미지가 있을 경우에만 FormData에 이미지 추가
    if (form.profileImage) {
      formData.append("profileImage", form.profileImage);
    }

    try {
      await instance.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // multipart/form-data로 전송
        },
      });
      alert("회원가입 성공");
      navigate("/login");
    } catch (error) {
      alert("회원가입 실패");
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-content">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/login")} // 뒤로가기 버튼 클릭 시 로그인 화면으로 이동
          >
            &larr;
          </button>
          <h2 className="register-title">회원가입</h2>
          <div
            className="register-preview-container"
            onClick={handlePreviewClick} // 프리뷰 클릭 시 파일 선택 창 띄우기
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="register-preview"
              />
            ) : (
              <span>이미지 선택</span>
            )}
          </div>
          <label htmlFor="email" className="register-label">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="register-input"
          />
          <label htmlFor="nickname" className="register-label">
            닉네임
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            className="register-input"
          />
          <label htmlFor="phone" className="register-label">
            폰 번호
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="register-input"
          />
          <label htmlFor="role" className="register-label">
            역할
          </label>
          <select
            id="auth"
            name="auth"
            value={form.auth}
            onChange={handleChange}
            className="register-input"
          >
            <option value="">-- 선택 --</option>
            <option value="USER">사용자</option>
            <option value="OWNER">사장님</option>
          </select>
          <label htmlFor="password" className="register-label">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={validatePassword}
            className="register-input"
          />
          <label htmlFor="confirmPassword" className="register-label">
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={validatePassword}
            className="register-input"
          />
          {passwordError && 
          <span className="error">{passwordError}</span>}
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            className="register-file-input"
          />
        </div>
        <button type="submit" className="register-button">
          회원가입
        </button>
      </form>
    </div>
  );
}

export default Register;
