import React, { useEffect, useState } from "react";
import "./css/MenuManage.css";
import { useNavigate, useParams, Link } from "react-router-dom"; 
import instance from "../api/axios";
import Header from "./Header";

const CreateMenu = () => {
  const navigate = useNavigate();
  const { storeId } = useParams(); 

  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    menuName: "",
    menuPrice: "",
    menuContents: "",
    menuImageUrl: null, 
    newImageFile: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeId) {

    } else {
      setError("잘못된 요청입니다.");
      setLoading(false);
    }
  }, [storeId]);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("업로드된 파일:", file);

        setForm({ ...form, newImageFile: file });
        setImagePreview(URL.createObjectURL(file)); // 미리보기 업데이트    
    }
  };

  const handlePreviewClick = () => {
    document.getElementById("newImageFile").click(); // 프리뷰 클릭 시 파일 선택 창 띄우기
  };

  // 저장 버튼 클릭 시 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("menuName", form.menuName);
    formData.append("menuPrice", form.menuPrice);
    formData.append("menuContents", form.menuContents);

    if (form.newImageFile) {
      formData.append("image", form.newImageFile); 
    }

    for (let [key, value] of formData.entries()) {
      console.log(`FormData - ${key}:`, value);
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await instance.post(`/stores/${storeId}/menus`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("서버 응답:", response.data);

      alert("메뉴 생성 완료");
      navigate("/menu-manage");
    } catch (error) {
      console.error("Error occurred:", error);
      alert("메뉴 생성에 실패했습니다.");
    }
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          <div className="title-container">
            <h1>메뉴 등록</h1>
          </div>

          {/* 이미지 미리보기 및 파일 업로드 */}
          <div className="register-preview-container">
            <input
              type="file"
              id="newImageFile"
              name="newImageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="register-file-input"
              style={{ display: "none" }}
            />
          </div>
          <div
            className="register-preview-container"
            onClick={handlePreviewClick} // 프리뷰 클릭 시 파일 선택 창 띄우기
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Menu Image"
                className="register-preview"
              />
            ) : (
              <span>이미지 선택</span>
            )}
          </div>

          {/* 메뉴 등록 입력 폼 */}
            <div className="menu-info">
              <label className="register-label">메뉴 이름</label>
              <input
                type="text"
                name="menuName"
                value={form.menuName}
                onChange={handleChange}
                className="menu-input"
              />

              <label className="register-label">가격</label>
              <input
                type="text"
                name="menuPrice"
                value={form.menuPrice}
                onChange={handleChange}
                className="menu-input"
              />

              <label className="register-label">설명</label>
              <input
                type="text"
                name="menuContents"
                value={form.menuContents}
                onChange={handleChange}
                className="menu-input"
              />
            </div>

          {/* 저장 버튼 */}
          <div className="button-container">
            <Link to="/menu-manage">
            <button>취소</button>
            </Link>
            <button onClick={handleSubmit}>저장</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMenu;
