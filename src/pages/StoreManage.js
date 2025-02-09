import React, { useEffect, useState } from "react";
import "./css/StoreManage.css";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import logoImage from "../assets/company-logo.png";
import instance from "../api/axios";
import Header from "./Header";
import { format } from "date-fns"
const StoreManage = () => {
  //   const [stores, setStores] = useState({});
  //   const [keywords] = useState([
  //     "웨이팅 핫플!",
  //     "혼자 먹어요",
  //     "새로 오픈했어요!",
  //   ]);
  const navigate = useNavigate();
  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
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
  const handleStoreChange = (event) => {
    const selectedStoreId = event.target.value;
    const store = storeList.find((store) => store.storeId === parseInt(selectedStoreId));
    setSelectedStore(store);
  };
  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="home">
          <div className="title-container">
            <h1>가게 관리</h1>
            {/* 드롭다운 목록으로 가게 이름 선택 */}
            <select onChange={handleStoreChange} defaultValue=""
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
          {selectedStore && (
            <div className="store-info">
              <div className="info-container">
                <p className="info-title">가게 이름 : </p>
                <p className="info-title">카테고리 : </p>
                <p className="info-title">가게 설명 : </p>
                <p className="info-title">가게 주소 : </p>
                <p className="info-title">전화번호 : </p>
                <p className="info-title">대표 메뉴 : </p>
                <p className="info-title">가게 상태 : </p>
                <p className="info-title">가게 등록일 : </p>
              </div>
              <div className="info-container">
                <p>{selectedStore.storeName}</p>
                <p>{selectedStore.storeCategory}</p>
                <p>{selectedStore.storeContent}</p>
                <p>{selectedStore.storeAddress}</p>
                <p>{selectedStore.storeTel}</p>
                <p>{selectedStore.presentMenu}</p>
                <p>{selectedStore.storeStatus}</p>
                <p>{format(selectedStore.createdAt, "yyyy-MM-dd")}</p>
              </div>
              <div className="img-container">
                {selectedStore.storeImageUrl ? (
                  <img
                    src={selectedStore.storeImageUrl}
                    alt="프로필 이미지"
                  />
                ) : (
                  <img
                    src={require("../assets/company-logo.png")}
                    alt="기본 프로필 이미지"
                  />)}
              </div>
            </div>
          )}
          {/* 선택되지 않으면 안내 메시지 */}
          {!selectedStore && <p>가게를 선택해주세요.</p>}
          <div className="button-container">
            <button
              onClick={() => navigate("/store/create")}
            >가게 추가</button>
            {selectedStore && <button
              onClick={() => navigate("/store/update", { state: { selectedStore } })}
            >가게 정보 수정</button>}
            {selectedStore && <button
              onClick={() => navigate("/store/hours", { state: { selectedStore } })}
            >영업시간 및 휴무 관리</button>}
          </div>
        </div>
      </div>
    </div >
  );
};
export default StoreManage;