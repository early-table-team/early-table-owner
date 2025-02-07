import React, { useEffect, useState } from "react";
import "./css/ReviewManage.css";
import { useNavigate } from "react-router-dom";
import instance from "../api/axios";
import Header from "./Header";

const ReviewManage = () => {
  const navigate = useNavigate();

  const [storeList, setStoreList] = useState([]); // 가게 리스트
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게
  const [reviews, setReviews] = useState([]); // 선택된 가게의 리뷰 리스트

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 선택된 가게 변경 시 리뷰 데이터 가져오기
  useEffect(() => {
    if (!selectedStore) return;

    const getReviews = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await instance.get(`/stores/${selectedStore.storeId}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReviews(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };

    getReviews();
  }, [selectedStore]);

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
            <h1>리뷰 관리</h1>
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

          {/* 리뷰 리스트 */}
          {selectedStore && (
            <div className="review-list">
              {reviews.length > 0 ? (
                <ul className="reviews-container">
                  {reviews.map((review) => (
                    <div key={review.reviewId} className="review-item">
                      <div className="review-info">
                        <h3>{review.reviewerNickname}</h3>
                        <p>
                          {Array.from({ length: review.rating }, () => "⭐").join("")}
                        </p>
                        <p>{review.reviewContents || "내용 없음"}</p>
                        <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* 리뷰 이미지 표시 */}
                      {review.reviewImageUrlMap && Object.keys(review.reviewImageUrlMap).length > 0 && (
                        <div className="review-images">
                          {Object.values(review.reviewImageUrlMap).map((imageUrl, index) => (
                            <img key={index} src={imageUrl} alt={`리뷰 이미지 ${index + 1}`} className="review-image" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </ul>
              ) : (
                <p>리뷰가 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewManage;
