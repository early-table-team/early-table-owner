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

  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [reservationDetail, setReservationDetail] = useState(null);

  const statusMapping = {
    예정: "PENDING",
    완료: "COMPLETED",
    취소: "CANCELED",
    결제완료: "CASHED",
  };

  useEffect(() => {
    const getStoreList = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await instance.get("/stores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStoreList(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (error) {
        console.error("Error fetching store list:", error);
        setError("가게 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    getStoreList();
  }, []);

  const handleStoreChange = (event) => {
    const selectedStoreId = event.target.value;
    const store = storeList.find((store) => store.storeId === parseInt(selectedStoreId));
    setSelectedStore(store);
    setReservationDetail(null); // 예약 상세 정보 초기화
    setReservations([]); // 기존 예약 목록 초기화
    setSelectedDate(new Date());
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setReservationDetail(null); // 날짜 변경 시 예약 상세 정보 클리어
    if (!selectedStore) return;
    try {
      const token = localStorage.getItem("accessToken");
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await instance.get(
        `/owner/reservations?reservationDate=${formattedDate}&storeId=${selectedStore.storeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sortedReservations = response.data.sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
      setReservations(sortedReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    }
  };

  const handleReservationClick = async (reservationId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await instance.get(`/owner/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservationDetail(response.data);
    } catch (error) {
      console.error("Error fetching reservation details:", error);
      setReservationDetail(null);
    }
  };

   // 상태 변경 함수
   const handleStatusChange = async (statusText) => {
    const status = statusMapping[statusText]; // 버튼 텍스트에 맞는 상태값으로 변환
    if (!reservationDetail) return;
  
    try {
      const token = localStorage.getItem("accessToken");
      const response = await instance.patch(
        `/owner/reservations/${reservationDetail.reservationId}`,
        { reservationStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // 상태 변경 후 예약 상세 정보를 갱신
      setReservationDetail((prevDetail) => ({
        ...prevDetail,
        reservationStatus: statusText, // 여기서는 화면에 보여줄 텍스트 상태를 업데이트
      }));
  
      // 예약 목록도 갱신 (현재 날짜와 선택된 가게에 맞는 예약 목록을 불러옴)
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const reservationsResponse = await instance.get(
        `/owner/reservations?reservationDate=${formattedDate}&storeId=${selectedStore.storeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sortedReservations = reservationsResponse.data.sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
      setReservations(sortedReservations); // 예약 리스트 갱신
  
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
          <div className="right-panel">
            <div className="title-container">
              <h1>예약 내역</h1>
              <select onChange={handleStoreChange} defaultValue="" className="store-drop">
                <option value="" disabled>가게를 선택하세요</option>
                {storeList.map((store) => (
                  <option key={store.storeId} value={store.storeId}>{store.storeName}</option>
                ))}
              </select>
            </div>

            {selectedStore && (
              <div className="container">
                <div class="top-row">
                <div className="div-item" style={{ width: "500px", height: "400px" }}>
                  <Calendar onChange={handleDateChange} value={selectedDate} calendarType="gregory" />
                </div>

                <div className="div-item">
                  <h2>{format(selectedDate, "yyyy-MM-dd")} 예약 내역</h2>
                  {reservations.length > 0 ? (
                    <ul>
                      {reservations.reduce((acc, reservation, index, array) => {
                        if (index === 0 || reservation.reservationTime !== array[index - 1].reservationTime) {
                          acc.push(<h3 key={`time-${reservation.reservationTime}`}>{reservation.reservationTime}</h3>);
                        }
                        acc.push(
                          <div key={reservation.reservationId} className="reservation-item" onClick={() => handleReservationClick(reservation.reservationId)}>
                            <p>{reservation.representativeName}님 | {reservation.personnelCount}명</p>
                            <button className="edit">{reservation.reservationStatus}</button>
                          </div>
                        );
                        return acc;
                      }, [])}
                    </ul>
                  ) : (
                    <p>예약 내역이 없습니다.</p>
                  )}
                </div>
                </div>
                {reservationDetail && (
                  <div class="bottom-row">
                  <div className="div-item">
                    <h2>예약 상세 정보</h2><hr />
                    <p>예약자: {reservationDetail.representativeName}</p>
                    <p>연락처: {reservationDetail.phoneNumber}</p>
                    <p>예약 날짜: {reservationDetail.reservationDate}</p>
                    <p>예약 시간: {reservationDetail.reservationTime}</p>
                    <p>인원수: {reservationDetail.personnelCount}명</p>
                    <p>상태: {reservationDetail.reservationStatus}</p>
                    <div className="reservation-button-container">
                      <button className="edit" onClick={() => handleStatusChange("예정")}>예정</button>
                      <button className="edit" onClick={() => handleStatusChange("완료")}>완료</button>
                      <button className="edit" onClick={() => handleStatusChange("취소")}>취소</button>
                      <button className="edit" onClick={() => handleStatusChange("결제완료")}>결제완료</button>
                    </div>
                  </div>
                  </div>
                )}

              </div>
            )}

            {!selectedStore && <p>가게를 선택해주세요.</p>}

            <div className="button-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails;
