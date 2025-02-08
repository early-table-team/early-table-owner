import React, { useEffect, useState, useRef } from "react";
import "./css/StoreCreate.css";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import instance from "../api/axios";
import Header from "./Header";


const StoreCreate = () => {
  const navigate = useNavigate();


  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태


  const fileInputRef = useRef(null);
  const [previewImages, setPreviewImages] = useState([]);

  const [form, setForm] = useState({
    storeName: "",
    storeContents: "",
    storeTel: "",
    topRegion: "",
    bottomRegions: "",
    storeCategory: "",
    storeAddress: "",
    profileImage: [],
  });


  const handleSubmit = async (e) => {

    const formData = new FormData();

    const selectedCategory = filters.storeCategories.find(
      (category) => category.name === '한식'  // 예시: '한식'을 찾기
    );
    const selectedCode = selectedCategory ? selectedCategory.code : null;

    const selectTop = form.topRegion?.match(/[A-Za-z]+/)?.[0] || null;
    const selectBottom = form.bottomRegions?.match(/[A-Za-z]+/)?.[0] || null;

    formData.append("storeName", form.storeName);
    formData.append("storeContents", form.storeContents);
    formData.append("storeTel", form.storeTel);
    formData.append("storeAddress", form.storeAddress);
    formData.append("regionTop", selectTop);
    formData.append("regionBottom", selectBottom);
    formData.append("storeCategory", selectedCode || null);

    // 이미지가 있을 경우에만 FormData에 이미지 추가
    if (previewImages) {
      previewImages.forEach((image) => {
        formData.append("newStoreImageList", image); 
      });    }

    try {
      await instance.post("/pending-stores", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // multipart/form-data로 전송
        },
      });
      alert("가게 생성 요청 성공");
    } catch (error) {
      alert("가게 생성 요청 실패");
    }
  };


  const [filters, setFilters] = useState({
    regions: [],
    storeCategories: [],
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
  
    setForm((prevForm) => {
      const newForm = { ...prevForm, [name]: value };
  
      // topRegion이 변경되었을 때, bottomRegion을 자동으로 첫 번째 값으로 설정
      if (name === "topRegion" && value) {
        const selectedRegion = filters.regions.find(
          (region) => region.topRegion === value
        );
        if (selectedRegion && selectedRegion.bottomRegions) {
          // 첫 번째 하위 지역을 자동으로 설정
          newForm.bottomRegions = selectedRegion.bottomRegions.split(",")[0].trim();
        }
      }
  
      return newForm;
    });
  };


  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const getFilter = async () => {
      try {
        const response = await instance.get("users/search/init", {
          headers: {
            Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
          },
        });

        setFilters({
          regions: response.data.regions,
          storeCategories: response.data.storeCategories,
          allergyCategories: response.data.allergy,
          allergyStuff: response.data.allergyStuff,
        });

      } catch (error) {
        console.error("필터 데이터 로드 실패:", error);
      }

    }

    getFilter();

  }, [token]);

  const handlePreviewClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));

    setPreviewImages((prevImages) => [...prevImages, ...imageUrls]); // 기존 이미지 유지
  };

  const handleRemoveImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          <div className="title-container">
            <h1>가게 생성</h1>
          </div>


          {/* 선택된 가게 정보 표시 */}

          <div className="store-info">
            <div className="info-container">
              <p className="info-title">가게 이름 : </p>
              <p className="info-title">카테고리 : </p>
              <p className="info-title">가게 설명 : </p>
              <p className="info-title">상위 지역 : </p>
              <p className="info-title">하위 지역 : </p>
              <p className="info-title">가게 주소 : </p>
              <p className="info-title">전화번호 : </p>
            </div>

            <div className="info-container">
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                className="register-input"
              />

              {/* 카테고리 드롭다운 */}
              <select
                name="storeCategory"
                value={form.storeCategory}
                onChange={(e) => {
                  handleChange({
                    target: {
                      name: "storeCategory",
                      value: e.target.value,
                    },
                  });
                }}
              >
                <option value="">카테고리 선택</option>
                {filters.storeCategories.map((category, index) => (
                  <option key={index} value={category.code}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                id="storeContents"
                name="storeContents"
                value={form.storeContents}
                onChange={handleChange}
                className="register-input"
              />

              {/* 상위 지역 드롭다운 */}
              <select
                name="topRegion"
                value={form.topRegion}
                onChange={handleChange}
              >
                <option value="">상위 지역 선택</option>
                {filters.regions.map((region, index) => (
                  <option key={index} value={region.topRegion}>
                    {region.topRegion.split(" (")[1].slice(0, -1)}
                  </option>
                ))}
              </select>


              {/* 상위 지역을 클릭했을 때 새로운 영역에 하위 지역 버튼들이 표시됨 */}

              <select
                name="bottomRegions"
                value={form.bottomRegions}
                onChange={handleChange}
              >

                {form.topRegion ? (
                  filters.regions
                    .find((region) => region.topRegion === form.topRegion)
                    ?.bottomRegions?.split(",") // 문자열을 쉼표로 분리하여 배열로 변환
                    .map((bottomRegions, subIndex) => (
                      <option key={subIndex} value={bottomRegions.trim()}>
                        {bottomRegions.trim().split(" (")[1]?.slice(0, -1) || bottomRegions.trim()}
                      </option>
                    ))
                ) :
                  (
                    <option>- 상위 지역을 선택해주세요 -</option>
                  )}

              </select>


              <input
                type="text"
                id="storeAddress"
                name="storeAddress"
                value={form.storeAddress}
                onChange={handleChange}
                className="register-input"
              />

              <input
                type="text"
                id="storeTel"
                name="storeTel"
                value={form.storeTel}
                onChange={handleChange}
                className="register-input"
              />
              <div>

              </div>
            </div>

            <div className="image-uploader">
              <input
                type="file"
                id="newImageFile"
                ref={fileInputRef}
                className="hidden-input"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* 미리보기 영역 */}
              <div className="preview-container">
                {previewImages.map((src, index) => (
                  <div key={index} className="preview-box">
                    <img src={src} alt={`preview-${index}`} className="preview-image" />
                    <button className="remove-btn" onClick={() => handleRemoveImage(index)}>✕</button>
                  </div>
                ))}
              </div>
              <button className="upload-btn" onClick={handlePreviewClick}>이미지 변경</button>
            </div>

          </div>

          {/* 선택되지 않으면 안내 메시지 */}


          <div className="button-container">
            <button
              onClick={() => {
                handleSubmit();
              }
              }>가게 생성</button>
          </div>

        </div>
      </div>
    </div >
  );
};

export default StoreCreate;
