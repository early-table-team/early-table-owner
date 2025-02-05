import React, { useEffect, useState } from "react";
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

  const location = useLocation();
  const selectedStoreFromState = location.state?.selectedStore || null; // 네비게이션에서 넘어온 가게

  const [form, setForm] = useState({
    storeName: "",
    storeContents: "",
    storeTel: "",
    topRegion: "",
    bottomRegions: "",
    storeCategory: "",
    profileImage: [],
  });

  const [filters, setFilters] = useState({
    regions: [],
    storeCategories: [],
  });

  const handleSubmit = async (e) => {

    const formData = new FormData();

    const selectedCategory = filters.storeCategories.find(
      (category) => category.name === '한식'  // 예시: '한식'을 찾기
    );
    const selectedCode = selectedCategory ? selectedCategory.code : null;

    console.log(selectedCode);

    const selectTop = form.topRegion && form.topRegion.match(/[A-Za-z]+/)
      ? form.topRegion.match(/[A-Za-z]+/)[0]
      : null;

    const selectBottom = form.bottomRegions && form.bottomRegions.match(/[A-Za-z]+/)
      ? form.bottomRegions.match(/[A-Za-z]+/)[0]
      : null;
    if (form.storeName) {
      formData.append("storeName", form.storeName);
    }
    if (form.storeContents) {
      formData.append("storeContents", form.storeContents);
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
      formData.append("profileImage", form.profileImage);
    }

    try {
      await instance.put(`/pending-stores/stores/${selectedStore.storeId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // multipart/form-data로 전송
        },
      });
      alert("가게 수정 요청 성공");
      navigate("/login");
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



  const handleStoreChange = (event) => {
    const selectedStoreId = event.target.value;
    const store = storeList.find((store) => store.storeId === parseInt(selectedStoreId));
    setSelectedStore(store);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
              className="store-drop">
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
            <div className="img-container">
              <img
                src={require("../assets/company-logo.png")}
                alt="기본 프로필 이미지"
              />
              <button>이미지 변경</button>
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
