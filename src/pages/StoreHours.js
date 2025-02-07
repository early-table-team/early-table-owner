import React, { useEffect, useState } from "react";
import "./css/StoreHours.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // React Router 사용
import instance from "../api/axios";
import Header from "./Header";
import { format, parse } from 'date-fns';


const StoreHours = () => {
  const navigate = useNavigate();


  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const location = useLocation();
  const selectedStoreFromState = location.state?.selectedStore || null; // 네비게이션에서 넘어온 가게


  const [formList, setFormList] = useState([
    { hourId: "", dayOfWeek: "MON", openTime: "", closedTime: "", dayStatus: "OPEN" },
    { hourId: "", dayOfWeek: "TUE", openTime: "", closedTime: "", dayStatus: "OPEN" },
    { hourId: "", dayOfWeek: "WED", openTime: "", closedTime: "", dayStatus: "OPEN" },
    { hourId: "", dayOfWeek: "THU", openTime: "", closedTime: "", dayStatus: "OPEN" },
    { hourId: "", dayOfWeek: "FRI", openTime: "", closedTime: "", dayStatus: "OPEN" },
    { hourId: "", dayOfWeek: "SAT", openTime: "", closedTime: "", dayStatus: "OPEN" },
    { hourId: "", dayOfWeek: "SUN", openTime: "", closedTime: "", dayStatus: "OPEN" }
  ]);


  const [form, setForm] = useState({
    storeOffDay: "",
    storeOffReason: ""
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    const getStoreHours = async () => {

      setFormList([
        { hourId: "", dayOfWeek: "MON", openTime: "", closedTime: "", dayStatus: "OPEN" },
        { hourId: "", dayOfWeek: "TUE", openTime: "", closedTime: "", dayStatus: "OPEN" },
        { hourId: "", dayOfWeek: "WED", openTime: "", closedTime: "", dayStatus: "OPEN" },
        { hourId: "", dayOfWeek: "THU", openTime: "", closedTime: "", dayStatus: "OPEN" },
        { hourId: "", dayOfWeek: "FRI", openTime: "", closedTime: "", dayStatus: "OPEN" },
        { hourId: "", dayOfWeek: "SAT", openTime: "", closedTime: "", dayStatus: "OPEN" },
        { hourId: "", dayOfWeek: "SUN", openTime: "", closedTime: "", dayStatus: "OPEN" }
      ]);

      try {
        //JWT 토큰 가져오기
        const token = localStorage.getItem("accessToken");

        const response = await instance.get(`/stores/${selectedStore.storeId}/hours`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Spring Boot의 유저 정보 API 호출

        const data = response.data;
        if (data && data.length > 0) {
          const updatedList = formList.map((form) => {
            const matchedData = data.find((data) => data.dayOfWeek === form.dayOfWeek);
            return matchedData
              ? { ...form, hourId: matchedData.hourId, openTime: matchedData.openTime, closedTime: matchedData.closedTime, dayStatus: matchedData.dayStatus }
              : form;
          });

          setFormList(updatedList);
        }
      } catch (error) {
        console.error("Error fetching store list:", error);
        setError("가게 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false); // 로딩 상태 변경 추가
      }
    };

    getStoreHours();

  }, [selectedStore]); // 가게 변경 시 실행

  const handleSubmit = async (e) => {

    const createList = formList.filter((form) => !form.hourId);
    const updateList = formList.filter((form) => form.hourId);

    var errorCode = null;

    if (createList.length > 0) {

      for (let i = 0; i < createList.length; i++) {
        const formData = new FormData();

        formData.append(`dayOfWeek`, createList[i].dayOfWeek);
        formData.append(`openTime`, (updateList[i].openTime.length === 5 ? updateList[i].openTime + ":00" : updateList[i].openTime));
        formData.append(`closedTime`, (updateList[i].closedTime.length === 5 ? updateList[i].closedTime + ":00" : updateList[i].closedTime));
        formData.append(`dayStatus`, createList[i].dayStatus);

        console.log(createList[i]);

        try {
          await instance.post(`/stores/${selectedStore.storeId}/hours`, formData, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          errorCode = error;
        }
      }

    } else if (updateList) {

      for (let i = 0; i < updateList.length; i++) {
        const formData = new FormData();

        formData.append(`openTime`, (updateList[i].openTime.length === 5 ? updateList[i].openTime + ":00" : updateList[i].openTime));
        formData.append(`closedTime`, (updateList[i].closedTime.length === 5 ? updateList[i].closedTime + ":00" : updateList[i].closedTime));
        formData.append(`dayStatus`, updateList[i].dayStatus);

        console.log(updateList[i]);

        try {
          await instance.put(`/hours/${updateList[i].hourId}`, formData, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          errorCode = error;
        }
      }
    }

    if (errorCode) {
      alert("가게 영업시간 설정 실패");
    } else {
      alert("가게 영업시간 설정 성공");
    }
  };


  const handleRestSubmit = async (e) => {

    const formData = new FormData();

    formData.append(`storeOffDay`, form.storeOffDay);
    formData.append(`storeOffReason`, form.storeOffReason);

    try {
      await instance.post(`/rest/stores/${selectedStore.storeId}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("휴무일 등록 완료");

    } catch (error) {
      alert("휴무일 등록 실패");
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

  const token = localStorage.getItem("accessToken");


  const handleChange = (index, field, value) => {
    const newList = [...formList];

    if (field === "dayStatus" && value === "closed") {
      // "휴무" 선택 시 openTime & closedTime 자동 설정
      newList[index] = { ...newList[index], openTime: "00:00:00", closedTime: "00:00:00", dayStatus: value };
    } else {
      newList[index] = { ...newList[index], [field]: value };
    }

    setFormList(newList);
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          <div className="title-container">
            <h1>영업 시간 관리</h1>
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

          <div className="store-hour-container">
            <div>
              <h3 className="week-title"></h3>
              <div>오픈 시간</div>
              <h3>-</h3>
              <div>마감 시간</div>
            </div>
            {formList.map((form, index) => (
              <div key={index}>
                <h3 className="week-title">{form.dayOfWeek}</h3>
                <input
                  className="time-input"
                  type="time"
                  value={form.openTime}
                  onChange={(e) => {
                    const newList = [...formList];
                    newList[index].openTime = e.target.value;
                    setFormList(newList);
                  }}
                  disabled={form.dayStatus === "CLOSED"} // 휴무 선택 시 비활성화
                />
                <h3>-</h3>
                <input
                  className="time-input"
                  type="time"
                  value={form.closedTime}
                  onChange={(e) => {
                    const newList = [...formList];
                    newList[index].closedTime = e.target.value;
                    setFormList(newList);
                  }}
                  disabled={form.dayStatus === "CLOSED"} // 휴무 선택 시 비활성화
                />
                <select
                  value={form.dayStatus}
                  onChange={(e) => {
                    handleChange(index, "dayStatus", e.target.value)
                  }}
                >
                  <option value="OPEN">영업</option>
                  <option value="CLOSED">휴무</option>
                </select>
              </div>
            ))}
          </div>

          <div className="button-container">
            <button
              onClick={() => {
                handleSubmit();
              }
              }>영업시간 설정</button>
          </div>
          <h2>비정기 휴무 등록</h2>

          <div className="rest-container">
            <h3>휴무일</h3>
            <input
              className="date-input"
              type="date"
              id="storeOffDay"
              name="storeOffDay"
              value={form.storeOffDay}
              onChange={handleDateChange}>
            </input>
            <h3>휴무 사유</h3>
            <input
              type="text"
              id="storeOffReason"
              name="storeOffReason"
              value={form.storeOffReason}
              onChange={handleDateChange}
              className="date-input"
            />
          </div>
          <div className="button-container">
            <button
              onClick={() => {
                handleRestSubmit();
              }
              }>휴무일 등록</button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default StoreHours;
