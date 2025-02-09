import React, { useEffect, useState } from "react";
import "./css/Waiting.css";
import "react-calendar/dist/Calendar.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // React Router 사용
import instance from "../api/axios";
import Header from "./Header";
import Calendar from "react-calendar";
import { async } from "q";


const WaitingSetting = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date()); // 초기값을 Date 객체로 설정
  const [selectedButton, setSelectedButton] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [waitingDetail, setWaitingDetail] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);




  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const location = useLocation();

  const statusMapping = {
    PENDING: "대기",
    COMPLETED: "완료",
    CANCELED: "취소",
    DELAY: "미루기",
  };

  // 매장/포장 버튼 이벤트
  const handleButtonClick = (button) => {
    if (selectedButton !== button) {
      setSelectedButton(button); // 선택된 버튼을 변경
    }

    if (button === "포장") {
      handleChange({
        target: {
          name: "waitingType",
          value: "TO_GO",
        },
      });
    } else {
      handleChange({
        target: {
          name: "waitingType",
          value: "DINE_IN",
        },
      });
    }
  };

  const today = new Date();
  today.setHours(today.getHours() + 9); // UTC 기준에서 KST(한국시간)으로 조정
  const formattedToday = today.toISOString().split("T")[0];

  const [form, setForm] = useState({
    waitingType: "",
    date: formattedToday
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {

    getWaitingList();

  }, [selectedStore, form]);

  const getWaitingList = async () => {
    console.log(form);

    try {
      //JWT 토큰 가져오기
      const token = localStorage.getItem("accessToken");

      if (form.waitingType && form.date) {

        console.log("form data:", form);

        const response = await instance.get(`/stores/${selectedStore.storeId}/waiting`, {
          params: {
            date: form.date,
            waitingType: form.waitingType,
          },
        }); // Spring Boot의 유저 정보 API 호출

        const data = response.data;
        console.log(data);

        setPendingCount(data.waitingList.filter(waiting => waiting.waitingStatus === "PENDING").length);
        const sortedList = data.waitingList.sort((a, b) => {
          if (a.waitingStatus === "PENDING" && b.waitingStatus !== "PENDING") {
            return -1;
          }
          if (a.waitingStatus !== "PENDING" && b.waitingStatus === "PENDING") {
            return 1;
          }
          return 0; // PENDING이 아닌 경우 기존 순서 유지
        });

        setWaitingList(sortedList);

      }

    } catch (error) {
      console.error("Error fetching store list:", error);
    }
  };
  const getWaitingDetail = async (waitingId) => {
    console.log(form);

    setWaitingDetail(null);

    try {
      //JWT 토큰 가져오기
      const token = localStorage.getItem("accessToken");
      const response = await instance.get(`/waiting/${waitingId}`, {
        headers: { Authorization: `Bearer ${token}` }

      }); // Spring Boot의 유저 정보 API 호출

      setWaitingDetail(response.data);

      console.log(waitingDetail);



    } catch (error) {
      console.error("Error fetching store list:", error);
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

  const handleDateChange = (e) => {

    const offset = e.getTimezoneOffset() * 60000; // 현재 타임존 오프셋 계산
    const localDate = new Date(e.getTime() - offset); // UTC에서 KST로 변환

    var formattedDate = localDate.toISOString()?.split("T")[0]; // 'YYYY-MM-DD' 형식
    setDate(e);
    handleChange({ target: { name: "date", value: formattedDate } });
  };



  const handleClick = async (waitingId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await instance.patch(
        `/waiting/${waitingId}/status/complete`,
        {}, // 여기에 전송할 데이터가 있다면 작성
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      getWaitingList();




    } catch (error) {
      console.error("Error fetching store list:", error);
    }
  };

  // 상태 변경 함수
  const handleStatusChange = async (waitingStatus, waitingId) => {
    try {
      const token = localStorage.getItem("accessToken");
      var response;
      switch (waitingStatus) {
        case "pending": 
          response = await instance.patch(
          `/waiting/${waitingId}/status/restore`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        break;
        case "completed": 
          response = await instance.patch(
          `/waiting/${waitingId}/status/complete`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        break;
        case "canceled": 
          response = await instance.delete(
          `/waiting/${waitingId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        break;
      }


    } catch (error) {
      console.error("Error updating reservation status:", error);
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
            <h1>웨이팅 관리</h1>
            {/* 드롭다운 목록으로 가게 이름 선택 */}
            <select onChange={handleStoreChange}
              className="store-drop">
              <option value="" disabled>
                가게를 선택하세요
              </option>
              {storeList.map((store) => (
                <option key={store.storeId}
                  value={store.storeId}>
                  {store.storeName}
                </option>
              ))}
            </select>
          </div>

          <div className="contents-container">
            <div className="date-picker-container">
              <h1 className="date-picker-title">
                날짜 선택</h1>
              <Calendar
                onChange={handleDateChange}
                value={date}
                locale="ko-KR"
                calendarType="gregory" />
            </div>

            <div className="detail-container">
              <p className="date-picker-text">
                {date.toLocaleDateString()}
              </p>
              <div className="type-container">
                <button
                  className={selectedButton === "매장" ? "selected" : ""}
                  onClick={() => handleButtonClick("매장")}
                >
                  매장
                </button>
                <button
                  className={selectedButton === "포장" ? "selected" : ""}
                  onClick={() => handleButtonClick("포장")}
                >
                  포장
                </button>
              </div>
              <ul className="waiting-list">
                {waitingList.length > 0 ? (
                  waitingList.map((waiting) => (
                    <li key={waiting.waitingId} className="waiting-item"
                      onClick={() => getWaitingDetail(waiting.waitingId)}>
                      <span className="waiting-number">{waiting.waitingNumber}번 </span>
                      <span className="waiting-personnel">{waiting.personnelCount}명</span>
                      <span
                        className={`waiting-status ${waiting.waitingStatus.toLowerCase()}`}
                        onClick={(event) => {
                          if (waiting.waitingStatus === "PENDING") {
                            event.stopPropagation();  // 이벤트 전파 중지
                            handleClick(waiting.waitingId);  // status 클릭 시에만 호출
                          }
                        }}                      >
                        {statusMapping[waiting.waitingStatus]}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="waiting-empty">웨이팅 목록이 없습니다.</p>
                )}
              </ul>
            </div>
            <div className="waiting-count">현재 대기 인원 : {pendingCount}</div>
          </div>
          {waitingDetail && (
            <div class="bottom-row">
              <div className="div-item">
                <h2>예약 상세 정보</h2><hr />
                <p>웨이팅 번호: {waitingDetail.waitingNumber}</p>
                <p>인원수: {waitingDetail.personnelCount}명</p>
                <p>연락처: {waitingDetail.phone}</p>
                <p>예약 상태: {waitingDetail.waitingStatus}</p>
                <p>예약 타입: {waitingDetail.waitingType}</p>
                <div className="reservation-button-container">
                  {waitingDetail.waitingStatus === "PENDING" ? (
                    <>
                      <button className="edit" onClick={() => handleStatusChange("completed", waitingDetail.waitingId)}>완료</button>
                      <button className="edit" onClick={() => handleStatusChange("canceled", waitingDetail.waitingId)}>취소</button>
                    </>
                  ) : waitingDetail.waitingStatus === "COMPLETED" ? (
                    <button className="edit" onClick={() => handleStatusChange("pending", waitingDetail.waitingId)}>대기</button>
                  ) : null}

                </div>
              </div>
            </div>
          )}
          <div className="button-container">
          </div>
        </div>
      </div >
    </div >
  );
};

export default WaitingSetting;
