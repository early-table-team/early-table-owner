import React, { useEffect, useState } from "react";
import "./css/Home.css";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import logoImage from "../assets/company-logo.png";
import instance from "../api/axios";
import Header from "./Header";

const Home = () => {
//   const [stores, setStores] = useState({});
//   const [keywords] = useState([
//     "웨이팅 핫플!",
//     "혼자 먹어요",
//     "새로 오픈했어요!",
//   ]);
  const navigate = useNavigate();

//   useEffect(() => {
//     // 가게 정보 가져오기
//     const fetchStores = async () => {
//       const token = localStorage.getItem("accessToken");
//       console.log(token);
//       if (!token || token === undefined) {
//         navigate("/login");
//       } else {
//         try {
//           const storeData = await Promise.all(
//             keywords.map(async (keyword) => {
//               const response = await instance.get(
//                 `/stores/search/keywords?keyword=${keyword}`,
//                 {
//                   headers: {
//                     "content-type": "text",
//                     Authorization:
//                       "Bearer " + localStorage.getItem("accessToken"),
//                   },
//                 }
//               );
//               const data = await response.data;
//               return {
//                 [keyword]: data.map((store) => ({
//                   id: store.storeId,
//                   name: store.storeName,
//                   image: store.imageUrl,
//                   starPoint: store.starPoint,
//                   reviewCount: store.reviewCount,
//                 })),
//               };
//             })
//           );

//           const storesObject = storeData.reduce(
//             (acc, data) => ({ ...acc, ...data }),
//             {}
//           );
//           setStores(storesObject);
//         } catch (error) {
//           console.error("가게 정보 가져오기 실패:", error);
//         }
//       }
//     };

//     fetchStores();
//   }, [keywords, navigate]);

  const handleCardClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
            <Header />
        </div>

        <div className="home">

          <div>홈 화면</div>

        </div>
      </div>
    </div>
  );
};

export default Home;
