import React, { useEffect, useState } from "react";
import "./css/MenuManage.css";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import logoImage from "../assets/company-logo.png";
import instance from "../api/axios";
import Header from "./Header";
import { format } from "date-fns"


const MenuManage = () => {
  //   const [stores, setStores] = useState({});
  //   const [keywords] = useState([
  //     "웨이팅 핫플!",
  //     "혼자 먹어요",
  //     "새로 오픈했어요!",
  //   ]);
  const navigate = useNavigate();


  const [storeList, setStoreList] = useState([]); // 가게 정보를 저장할 상태
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [selectedStoreMenus, setSelectedStoreMenus] = useState([]); // 선택된 가게의 메뉴 리스트

  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const statusMapping = {
    RECOMMENDED: "대표",
    NORMAL: "일반",
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
        console.log(response.data);

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

  const handleCardClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  const handleStoreChange = async (event) => {
    const selectedStoreId = event.target.value;
    const store = storeList.find((store) => store.storeId === parseInt(selectedStoreId));
    setSelectedStore(store);
  
    if (!store) {
      setSelectedStoreMenus([]); // 선택한 가게가 없으면 메뉴도 초기화
      return;
    }
  
    try {
      // JWT 토큰 가져오기
      const token = localStorage.getItem("accessToken");
  
      // 가게 ID로 메뉴 리스트 조회하는 API 호출
      const response = await instance.get(`/stores/${selectedStoreId}/menus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 메뉴 리스트를 statusMapping을 기준으로 변환
    const menusWithStatus = response.data.map((menu) => {
      // menuStatus를 'RECOMMENDED' -> '대표', 'NORMAL' -> '일반'으로 변환
      const mappedStatus = statusMapping[menu.menuStatus] || menu.menuStatus; // 매핑되지 않으면 그대로 사용
      return {
        ...menu,
        menuStatus: mappedStatus, // 변환된 상태를 menuStatus에 적용
      };
    });
  
      setSelectedStoreMenus(menusWithStatus); // 받아온 메뉴 리스트 상태 업데이트
    } catch (error) {
      console.error("Error fetching menu list:", error);
      setSelectedStoreMenus([]); // 에러 발생 시 빈 배열로 초기화
    }
  };

  const handleMenuModifyClick = (storeId, menuId) => {
    navigate(`/menu-manage/${storeId}/modify/${menuId}`);
  };

  const handleMenuCreateClick = (storeId) => {
    if (!storeId) {
      alert("가게를 먼저 선택해주세요!"); // 경고 메시지 표시
      return;
    }
    navigate(`/menu-manage/${storeId}/create`);
  };
  
  

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          <div className="title-container">
            <h1>메뉴 관리</h1>
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


          {/* 선택된 가게의 메뉴 정보 표시 */}
          {selectedStoreMenus.length > 0 ? (
            <div className="store-info">
                <div className="menu-list-container">
                        <ul>
                            {selectedStoreMenus.map((menu) => (
                                <li key={menu.menuId} className="menu-list">
                                <div className="menu-list-item">
                                    {menu.menuImageUrl ? (
                                            <img
                                            className="profile-img"
                                            src={menu.menuImageUrl}
                                            alt="메뉴 이미지"
                                            />
                                        ) : (
                                            <img
                                            className="profile-img"
                                            src={require("../assets/company-logo.png")}
                                            alt="기본 프로필 이미지"
                                            />
                                    )}
                                </div>
                                <div className="menu-info">
                                    <h3>{menu.menuName} [{menu.menuStatus}]</h3>
                                    <p>{menu.menuPrice}원</p>
                                    <p>{menu.menuContents}</p>
                                </div>
                                <button 
                                    className="menu-button"
                                    onClick={() => handleMenuModifyClick(selectedStore.storeId, menu.menuId)}>· · ·</button>
                                </li>
                            ))}
                        </ul>
                </div>

            </div>
          ) : (
            selectedStore && <p> 등록된 메뉴가 없습니다.</p>
          )}

          {/* 선택되지 않으면 안내 메시지 */}
          {!selectedStore && <p>가게를 선택해주세요.</p>}


          <div className="button-container">
            <button onClick={() => handleMenuCreateClick(selectedStore?.storeId)}>메뉴 추가</button>
          </div>
          
        </div>
      </div>
    </div >
  );
};

export default MenuManage;
