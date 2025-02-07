import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./css/StoreManage.css";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import logoImage from "../assets/company-logo.png";
import instance from "../api/axios";
import Header from "./Header";
import { format } from "date-fns";

const ReservationDetails = () => {
  const navigate = useNavigate();

  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜 상태

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
          <div className="right-panel">
            <div className="title-container">
              <h1>예약 내역</h1>
              {/* 드롭다운 목록으로 가게 이름 선택 */}
              <select onChange={handleStoreChange} defaultValue="" className="store-drop">
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

                {/* 캘린더 추가 */}
                <div className="calendar-container" style={{ width: "300px", height: "300px" }}>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    calendarType="gregory"
                  />
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
    </div>
  );
};

export default ReservationDetails;
