import React, { useEffect, useState } from "react";
import "./css/ReservationManage.css";
import instance from "../api/axios";
import Header from "./Header";

const ReservationManage = () => {
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]); // 테이블 정보를 위한 상태 추가
  const [newTable, setNewTable] = useState({ tableMaxNumber: "", tableCount: "" }); // 새로운 테이블 입력값 관리
  const [storeTimeSlots, setStoreTimeSlots] = useState([]); // 타임 슬롯 정보를 위한 상태 추가

  const reservationTypeReverseMap = {
    RESERVATION: "예약",
    ONSITE: "현장",
    REMOTE: "원격",
  };

  // 모달 관련 상태
  const [showModal, setShowModal] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState(""); // 새로운 타임슬롯 시간 입력 값

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await instance.get("/stores", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStoreList(response.data || []);
      } catch (error) {
        console.error("가게 정보를 불러오는 중 오류 발생:", error);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    fetchReservations();
    fetchTables(); // 가게를 선택할 때 테이블 정보도 조회
  }, [selectedStore]);

  useEffect(() => {
    if (!selectedStore) return; // 가게가 선택되지 않으면 실행하지 않음
    fetchStoreTimeSlots(); // 가게를 선택할 때마다 타임슬롯 데이터를 가져옴
  }, [selectedStore]);

  // 예약 정보를 불러오는 함수
  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await instance.get(
        `/stores/${selectedStore.storeId}/reservations/type`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReservations(response.data || []);
    } catch (error) {
      console.error("예약 정보를 불러오는 중 오류 발생:", error);
      setReservations([]);
    }
  };

  // 테이블 정보를 불러오는 함수
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await instance.get(
        `/stores/${selectedStore.storeId}/tables`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const sortedTables = response.data.storeTable || [];
        sortedTables.sort((a, b) => a.tableMaxNumber - b.tableMaxNumber); // 최대수용인원 기준 오름차순 정렬

        setTables(sortedTables);
    } catch (error) {
      console.error("테이블 정보를 불러오는 중 오류 발생:", error);
      setTables([]);
    }
  };

  const handleStoreChange = (event) => {
    const storeId = event.target.value;
    const store = storeList.find((store) => store.storeId === parseInt(storeId));
    setSelectedStore(store);
  };

  const handleReservationTypeChange = async (reservationType) => {
    if (!selectedStore) return;
  
    try {
      const token = localStorage.getItem("accessToken");
  
      // 클릭한 reservationType이 현재 설정된 예약 타입 목록에 있는지 확인
      const existingType = reservations.find(
        (res) => res.reservationType === reservationType
      );
  
      if (existingType) {
        try {
          // 예약 타입이 존재하면 삭제 API 호출
          await instance.delete(`/stores/${selectedStore.storeId}/reservations/type`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json", // JSON 타입 명시
            },
            data: { reservationType }, // DELETE 요청의 본문 데이터
          });
    
          console.log("예약 타입 삭제 성공:", reservationType);
        } catch (error) {
          console.log("예약 타입 삭제 실패:", error);
        }
        
      } else {
        // 예약 타입이 존재하지 않으면 추가 API 호출
        try {
          const requestData = {
            reservationType,
            waitingType: [], // 기본적으로 비어있는 대기 타입 배열 전달
          };
    
          await instance.post(`/stores/${selectedStore.storeId}/reservations/type`, requestData, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          console.log("예약 타입 추가 성공:", requestData);
        } catch (error) {
          console.log("예약 타입 추가 실패:", error);
        }
      }
  
      // 변경 후 최신 데이터 불러오기
      fetchReservations();
    } catch (error) {
      console.error("예약 타입 변경 중 오류 발생:", error);
    }
  };
  

  const toggleOption = async (reservationType, option) => {
    if (!selectedStore) return;

    try {
      const updatedReservations = reservations.map((res) =>
        res.reservationType === reservationType
          ? { ...res, [option]: !res[option] }
          : res
      );

      setReservations(updatedReservations);

      const requestData = {
        reservationType,
        waitingType: updatedReservations
          .filter((res) => res.reservationType === reservationType)
          .flatMap((res) => [
            res.dineIn ? "DINE_IN" : null,
            res.toGo ? "TO_GO" : null,
          ])
          .filter(Boolean),
      };

      const token = localStorage.getItem("accessToken");
      await instance.patch(`/stores/${selectedStore.storeId}/reservations/type`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("옵션 변경 성공:", requestData);

      // 변경 후 최신 데이터 불러오기
      fetchReservations();
    } catch (error) {
      console.error("옵션 변경 중 오류 발생:", error);
    }
  };

  // 삭제 버튼 클릭 시 처리 함수
  const handleDeleteTable = async (tableId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await instance.delete(`/stores/${selectedStore.storeId}/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`테이블 ${tableId} 삭제 완료`);
      fetchTables(); // 삭제 후 테이블 목록 갱신
    } catch (error) {
      console.error("테이블 삭제 중 오류 발생:", error);
    }
  };

  // 새로운 테이블 값 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable({ ...newTable, [name]: value });
  };

  // 새로운 테이블 저장 함수
  const handleSaveNewTable = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const requestData = {
        tableMaxNumber: newTable.tableMaxNumber,
        tableCount: newTable.tableCount,
      };

      const response = await instance.post(
        `/stores/${selectedStore.storeId}/tables`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 새 테이블 추가 후 테이블 목록 갱신
      fetchTables();

      // 테이블 추가 후 테이블 오름차순 정렬
      const sortedTables = [...tables, response.data].sort(
        (a, b) => a.tableMaxNumber - b.tableMaxNumber
      );
      setTables(sortedTables);
      setNewTable({ tableMaxNumber: "", tableCount: "" }); // 입력값 초기화
    } catch (error) {
      console.error("새로운 테이블 추가 중 오류 발생:", error);
    }
  };

  // 수정 버튼 클릭 시 처리 함수
    const handleEditTable = (table) => {
    const updatedTables = tables.map((t) =>
      t.tableId === table.tableId ? { ...t, isEditing: true } : t
    );
    setTables(updatedTables);
  };
  
  // 저장 버튼 클릭 시 처리 함수 (PUT API 연동)
  const handleSaveEditTable = async (tableId, updatedTable) => {
    try {
      const token = localStorage.getItem("accessToken");
      await instance.put(
        `/stores/${selectedStore.storeId}/tables/${tableId}`,
        updatedTable,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // 수정 완료 후 테이블 목록 갱신
      fetchTables();
    } catch (error) {
      console.error("테이블 수정 중 오류 발생:", error);
    }
  };

  // 입력 값 변경 함수 (수정 모드)
    const handleTableInputChange = (e, tableId) => {
    const { name, value } = e.target;
    const updatedTables = tables.map((table) =>
      table.tableId === tableId
        ? { ...table, [name]: value }
        : table
    );
    setTables(updatedTables);
  };
  
  // 가게의 타임슬롯을 불러오는 함수
    const fetchStoreTimeSlots = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await instance.get(
        `/stores/${selectedStore.storeId}/storeTimeSlots`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // reservationTime을 기준으로 오름차순 정렬
        const sortedTimeSlots = response.data.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.reservationTime}Z`);
        const timeB = new Date(`1970-01-01T${b.reservationTime}Z`);
        return timeA - timeB; // 오름차순 정렬
      });
  
      setStoreTimeSlots(sortedTimeSlots); // 정렬된 시간 슬롯 데이터 상태에 저장
    } catch (error) {
      console.error("가게 타임슬롯 정보를 불러오는 중 오류 발생:", error);
      setStoreTimeSlots([]); // 오류 발생 시 빈 배열로 설정
    }
  };

  //가게의 타임슬롯 삭제
  const handleDeleteTimeSlot = async (storeTimeSlotId) => {
    try {
        const token = localStorage.getItem("accessToken");
        await instance.delete(`/stores/${selectedStore.storeId}/storeTimeSlots/${storeTimeSlotId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`타임슬롯 ${storeTimeSlotId} 삭제 완료`);
          fetchStoreTimeSlots(); // 삭제 후 테이블 목록 갱신
        } catch (error) {
          console.error("타임슬롯 삭제 중 오류 발생:", error);
        }
  }

  // 타임슬롯 추가 모달을 열기 위한 함수
  const handleAddTimeSlotModal = () => {
    setShowModal(true);
  };

  // 타임슬롯 추가를 위한 입력 값 처리
  const handleNewTimeSlotChange = (e) => {
    setNewTimeSlot(e.target.value);
  };

  // 타임슬롯 추가 API 호출
  const handleAddTimeSlot = async () => {
    if (!newTimeSlot) {
      alert("시간을 입력해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await instance.post(
        `/stores/${selectedStore.storeId}/storeTimeSlots`,
        { reservationTime: newTimeSlot },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("타임슬롯 생성 완료");
      fetchStoreTimeSlots(); // 생성 후 타임슬롯 목록 갱신
      setShowModal(false); // 모달 닫기
      setNewTimeSlot(""); // 입력값 초기화
    } catch (error) {
      console.error("타임슬롯 추가 중 오류 발생:", error);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTimeSlot(""); // 입력값 초기화
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          <div className="title-container">
            <h1>예약 설정</h1>
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

          {!selectedStore && <p>가게를 선택해주세요.</p>}

          {/* 가게를 선택한 후에만 div1, div2, div3 보이도록 수정 */}
          {selectedStore && (
            <>
              <div className="reservationtype-div1">
                <h2>예약타입</h2>
                {selectedStore && (
                  <div className="reservation-list">
                    {["RESERVATION", "ONSITE", "REMOTE"].map((reservationType) => (
                      <div key={reservationType} className="reservation-item">
                        <button
                          className={`btn-rt ${reservationType.toLowerCase()} ${reservations.some(
                            (res) => res.reservationType === reservationType
                          ) ? "active" : ""}`}
                          onClick={() => handleReservationTypeChange(reservationType)}
                        >
                          {reservationTypeReverseMap[reservationType]}
                        </button>
                        <button
                          className={`btn dinein ${reservations.some(
                            (res) => res.reservationType === reservationType && res.dineIn
                          ) ? "active" : ""}`}
                          onClick={() => toggleOption(reservationType, "dineIn")}
                        >
                          매장
                        </button>
                        <button
                          className={`btn togo ${reservations.some(
                            (res) => res.reservationType === reservationType && res.toGo
                          ) ? "active" : ""}`}
                          onClick={() => toggleOption(reservationType, "toGo")}
                        >
                          포장
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="reservationtype-div2">
              <h2>테이블 목록</h2>
              {tables.length === 0 ? (
                <p>테이블 정보가 없습니다.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>최대수용인원</th>
                      <th>개수</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table) => (
                      <tr key={table.tableId}>
                        <td>
                            {table.tableMaxNumber}명
                        </td>
                        <td>
                          {table.isEditing ? (
                            <input
                              type="number"
                              name="tableCount"
                              value={table.tableCount}
                              onChange={(e) => handleTableInputChange(e, table.tableId)}
                            />
                          ) : (
                            `${table.tableCount}개`
                          )}
                        </td>
                        <td>
                          {table.isEditing ? (
                            <button
                              className="edit"
                              onClick={() => handleSaveEditTable(table.tableId, {
                                tableMaxNumber: table.tableMaxNumber,
                                tableCount: table.tableCount,
                              })}
                            >
                              저장
                            </button>
                          ) : (
                            <div className="button-container">
                              <button
                                className="edit"
                                onClick={() => handleEditTable(table)}
                              >
                                수정
                              </button>
                              <button
                                className="delete"
                                onClick={() => handleDeleteTable(table.tableId)}
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <input
                          type="number"
                          name="tableMaxNumber"
                          value={newTable.tableMaxNumber}
                          onChange={handleInputChange}
                          placeholder="최대수용인원"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="tableCount"
                          value={newTable.tableCount}
                          onChange={handleInputChange}
                          placeholder="개수"
                        />
                      </td>
                      <td>
                        <button className="edit" onClick={handleSaveNewTable}>
                          저장
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            {selectedStore && (
            <div className="reservationtype-div3">
                <h2>가게 타임슬롯 관리</h2>
                {storeTimeSlots.length === 0 ? (
                <p>타임슬롯 정보가 없습니다.</p>
                ) : (
                <div className="timeslot-list-container">
                    {storeTimeSlots.map((timeSlot) => (
                    <div className="timeslot-list" key={timeSlot.timeSlotId}>
                        {timeSlot.reservationTime.slice(0,5)}
                        <button className="delete" onClick={() => handleDeleteTimeSlot(timeSlot.timeSlotId)}>삭제</button>
                    </div>
                    ))}
                </div>
                )}
                <button className="edit" onClick={handleAddTimeSlotModal}>타임슬롯 추가</button>
            </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* 타임슬롯 추가 모달 */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>타임슬롯 추가</h2>
            <label>시간 (HH:mm)</label>
            <input
              type="time"
              value={newTimeSlot}
              onChange={handleNewTimeSlotChange}
            />
            <div className="modal-buttons">
              <button className="edit" onClick={handleCloseModal}>취소</button>
              <button className="edit" onClick={handleAddTimeSlot}>추가</button>
            </div>
          </div>
        </div>
      )}    

    </div>
  );
};

export default ReservationManage;
