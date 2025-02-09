import React, { useEffect, useState, useRef } from "react";
import "./css/StoreUpdate.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // React Router 사용
import instance from "../api/axios";
import Header from "./Header";


const StoreUpdate = () => {
  const navigate = useNavigate();


  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태


  const fileInputRef = useRef(null);
  const [previewImages, setPreviewImages] = useState([]);

  const location = useLocation();
  const selectedStoreFromState = location.state?.selectedStore || null; // 네비게이션에서 넘어온 가게

  const [form, setForm] = useState({
    storeName: "",
    storeContent: "",
    storeTel: "",
    topRegion: "",
    bottomRegions: "",
    storeCategory: "",
    storeAddress: "",
    profileImage: [],
    profileImageUrl: []
  });

  const [filters, setFilters] = useState({
    regions: [],
    storeCategories: [],
  });

  // 수정 요청 
  const handleSubmit = async (e) => {

    const formData = new FormData();

    const selectedCategory = filters.storeCategories.find(
      (category) => category.name === '한식'  // 예시: '한식'을 찾기
    );
    const selectedCode = selectedCategory ? selectedCategory.code : null;

    const selectTop = form.topRegion && form.topRegion.match(/[A-Za-z]+/)
      ? form.topRegion.match(/[A-Za-z]+/)[0]
      : null;

    const selectBottom = form.bottomRegions && form.bottomRegions.match(/[A-Za-z]+/)
      ? form.bottomRegions.match(/[A-Za-z]+/)[0]
      : null;
    if (form.storeName) {
      formData.append("storeName", form.storeName);
    }
    if (form.storeContent) {
      formData.append("storeContent", form.storeContent);
    }
    if (form.storeTel) {

      formData.append("storeTel", form.storeTel);
    }
    if (form.storeAddress) {
      formData.append("storeAddress", form.storeAddress);
    }
    if (selectTop) {
      formData.append("regionTop", selectTop);
    }
    if (selectBottom) {
      formData.append("regionBottom", selectBottom);
    }
    if (selectedCode) {
      formData.append("storeCategory", selectedCode);
    }
    // 이미지가 있을 경우에만 FormData에 이미지 추가
    if (form.profileImage) {
      form.profileImage.forEach((image, index) => {
        formData.append("newStoreImageList", image); // 여러 개의 파일을 같은 키로 추가
      });
    }

    try {
      await instance.put(`/pending-stores/stores/${selectedStore.storeId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // multipart/form-data로 전송
        },
      });
      alert("가게 수정 요청 성공");
    } catch (error) {
      alert("가게 수정 요청 실패");
    }
  };

  useEffect(() => {
    const getStoreList = async () => {

      try {
        //JWT 토큰 가져오기
        const token = localStorage.getItem("accessToken");

        const response = await instance.get("/stores", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Spring Boot의 유저 정보 API 호출

        const data = response.data;
        setStoreList(Array.isArray(data) ? data : [data]);

      } catch (error) {
        console.error("Error fetching store list:", error);
        setError("가게 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false); // 로딩 상태 변경 추가
      }
    };

    getStoreList();

  }, []); // 컴포넌트 마운트 시 한 번 실행

  // selectedStoreFromState 값이 있을 경우 자동으로 선택되도록 설정
  useEffect(() => {
    if (selectedStoreFromState) {
      setSelectedStore(selectedStoreFromState);
    }
  }, [selectedStoreFromState]);


  useEffect(() => {

    console.log(selectedStore);
    setForm((prevForm) => ({
      storeName: selectedStore?.storeName || "",
      storeContent: selectedStore?.storeContent,
      storeTel: selectedStore?.storeTel,
      topRegion: selectedStore?.regionTop || "",
      bottomRegions: selectedStore?.regionBottom || "",
      storeCategory: selectedStore?.storeCategory || "",
      storeAddress: selectedStore?.storeAddress,
      profileImageUrl: selectedStore?.storeImageUrl, // 파일은 직접 선택해야 하므로 빈 배열 유지
    }));
  }, [selectedStore]);


  const handleStoreChange = (event) => {
    const selectedStoreId = event.target.value;
    const store = storeList.find((store) => store.storeId === parseInt(selectedStoreId));
    console.log(store);
    setSelectedStore(store);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(value);
    setForm({ ...form, [name]: value });
  };


  const token = localStorage.getItem("accessToken");

  // Enum 가져오기
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
      fileInputRef.current.click()
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
            <h1>가게 정보 수정</h1>
            {/* 드롭다운 목록으로 가게 이름 선택 */}
            <select onChange={handleStoreChange}
              className="store-drop"
              value={selectedStore?.storeId || ""}>
              <option value="" disabled>
                가게를 선택하세요
              </option>
              {storeList.map((store) => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName}
                </option>
              ))}
            </select>
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
                value={form.storeCategory || ""}
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
                id="storeContent"
                name="storeContent"
                value={form.storeContent}
                onChange={handleChange}
                className="register-input"
              />

              {/* 상위 지역 드롭다운 */}
              <select
                name="topRegion"
                value={form.topRegion || ""}
                onChange={handleChange}
              >
                <option value="">상위 지역 선택</option>
                {filters.regions.map((region, index) => {
                  const regionCode = region.topRegion.split(" (")[0]; // "ULSAN" 추출
                  const regionName = region.topRegion.split(" (")[1]?.slice(0, -1) || region.topRegion; // "울산" 추출

                  return (
                    <option key={index} value={regionCode}>
                      {regionName} {/* 한국어 지역명 표시 */}
                    </option>
                  );
                })}
              </select>


              {/* 상위 지역을 클릭했을 때 새로운 영역에 하위 지역 버튼들이 표시됨 */}

              <select
                name="bottomRegions"
                value={form.bottomRegions || ""}
                onChange={handleChange}
              >
                {form.topRegion ? (
                  filters.regions
                    .find((region) => region.topRegion.split(" (")[0] === form.topRegion) // 영어 코드 비교
                    ?.bottomRegions?.split(",") // 쉼표로 구분된 하위 지역 리스트
                    .map((bottomRegion, subIndex) => {
                      const regionCode = bottomRegion.trim().split(" (")[0]; // 영어 코드
                      const regionName = bottomRegion.trim().split(" (")[1]?.slice(0, -1) || bottomRegion.trim(); // 한글 이름

                      return (
                        <option key={subIndex} value={regionCode}>
                          {regionName} {/* 한글 지역명 표시 */}
                        </option>
                      );
                    })
                ) : (
                  <option value="">- 상위 지역을 선택해주세요 -</option>
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
                {previewImages?.map((src, index) => (
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
              }>가게 정보 수정</button>
          </div>

        </div>
      </div>
    </div >
  );
};

export default StoreUpdate;
