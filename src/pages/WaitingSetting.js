import React, { useEffect, useState } from "react";
import "./css/WaitingSetting.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // React Router 사용
import instance from "../api/axios";
import Header from "./Header";
import { format, parse } from 'date-fns';


const WaitingSetting = () => {
  const navigate = useNavigate();
  const [isOn, setIsOn] = useState(false);

  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const location = useLocation();

  const [form, setForm] = useState({
    waitingSettingId: "",
    waitingOpenTime: "",
    waitingClosedTime: "",
    waitingSettingStatus: "CLOSE"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    const getWaitingSetting = async () => {
      setForm({
        waitingSettingId: "",
        waitingOpenTime: "",
        waitingClosedTime: "",
        waitingSettingStatus: "CLOSE"
      });

      setIsOn(false);

      try {
        //JWT 토큰 가져오기
        const token = localStorage.getItem("accessToken");

        const response = await instance.get(`/stores/${selectedStore.storeId}/waiting/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Spring Boot의 유저 정보 API 호출

        const data = response.data;

        setForm({
          waitingSettingId: data.waitingSettingId,
          waitingOpenTime: data.waitingOpenTime,
          waitingClosedTime: data.waitingClosedTime,
          waitingSettingStatus: data.waitingSettingStatus
        });

        setIsOn(data.waitingSettingStatus === "OPEN");

      } catch (error) {
        console.error("Error fetching store list:", error);
      } finally {
        setLoading(false); // 로딩 상태 변경 추가
      }
    };

    getWaitingSetting();

  }, [selectedStore]); // 가게 변경 시 실행

  const handleSubmit = async (e) => {

    const formData = new FormData();

    formData.append(`waitingOpenTime`, form.waitingOpenTime);
    formData.append(`waitingClosedTime`, form.waitingClosedTime);
    formData.append(`waitingSettingStatus`, form.waitingSettingStatus);

    if (form.waitingSettingId) {
      formData.append(`waitingSettingId`, form.waitingSettingId);

      try {
        await instance.put(`/waiting/settings/${form.waitingSettingId}`, formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        alert("웨이팅 수정 완료");
  
      } catch (error) {
        alert("웨이팅 수정 실패");
      }

    } else {
      try {
        const response = await instance.post(`/stores/${selectedStore.storeId}/waiting/settings`, formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        console.log(data);

        setForm({
          waitingSettingId: data.waitingSettingId
        });

        alert("웨이팅 설정 완료");
  
      } catch (error) {
        alert("웨이팅 설정 실패");
      }
    }

    


  };

  // 가게 리스트 가져오기
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

  const token = localStorage.getItem("accessToken");

  const handleToggleChange = () => {
    setIsOn((prev) => {
      const newStatus = !prev ? "OPEN" : "CLOSE"; // 토글 상태에 따라 "OPEN" 또는 "CLOSE"로 설정
      setForm({ ...form, waitingSettingStatus: newStatus });
      return !prev;
    });
  };





  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          <div className="title-container">
            <h1>웨이팅 설정</h1>
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
          <div className="waiting-container">
            <h3>웨이팅 오픈 시간</h3>
            <input
              className="time-input"
              type="time"
              id="waitingOpenTime"
              name="waitingOpenTime"
              value={form.waitingOpenTime}
              onChange={handleChange}>
            </input>

          </div>
          <div>
            <h3>웨이팅 마감 시간</h3>
            <input
              type="time"
              id="waitingClosedTime"
              name="waitingClosedTime"
              value={form.waitingClosedTime}
              onChange={handleChange}
              className="time-input"
            />

          </div>

          <div>
            <h3>현재 웨이팅 상태</h3>
            {/* 토글 스위치 */}
            <div className="toggl-container">
              <h3>CLOSE</h3>
              <div
                className={`toggle-button ${isOn ? 'on' : ''}`}
                onClick={handleToggleChange}
              >
                <div className="toggle-circle" />
              </div>
              <h3>OPEN</h3>
            </div>
            <div className="button-container">
              <button
                onClick={handleSubmit}
              >웨이팅 설정 저장</button>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default WaitingSetting;
