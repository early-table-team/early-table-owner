import React, { useEffect, useState } from "react";
import "./css/MenuManage.css";
import { useNavigate, useParams } from "react-router-dom"; 
import instance from "../api/axios";
import Header from "./Header";

const ModifyMenu = () => {
  const navigate = useNavigate();
  const { storeId, menuId } = useParams(); 

  const [menuDetails, setMenuDetails] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가
    const [allergyCategories, setAllergyCategories] = useState([]); // 알러지 카테고리 목록
    const [selectedAllergyCategoryId, setSelectedAllergyCategoryId] = useState(""); // 선택된 알러지 카테고리 ID
    const [allergyStuffs, setAllergyStuffs] = useState([]); // 알러지 원재료 목록
    const [selectedAllergyStuffs, setSelectedAllergyStuffs] = useState(""); // 선택된 알러지 원재료

    const [allergies, setAllergies] = useState([]);

    const statusMapping = {
      RECOMMENDED: "대표",
      NORMAL: "일반",
    };
  
  const [form, setForm] = useState({
    menuName: "",
    menuPrice: "",
    menuContents: "",
    menuStatus: "",
    menuImageUrl: null, 
    newImageFile: null,
  });

  const token = localStorage.getItem("accessToken");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeId && menuId) {
      const getMenuData = async () => {
        try {
          const token = localStorage.getItem("accessToken");

          const response = await instance.get(`/stores/${storeId}/menus/${menuId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMenuDetails(response.data);

          setForm({
            menuName: response.data.menuName || "",
            menuPrice: response.data.menuPrice || "",
            menuContents: response.data.menuContents || "",
            menuStatus: response.data.menuStatus || "",
            menuImageUrl: response.data.menuImageUrl || null,
            newImageFile: null,
          });

          // 기존 이미지 미리보기 설정
          if (response.data.menuImageUrl) {
            setImagePreview(response.data.menuImageUrl);
          }

          // 알러지 정보 가져오기
          const allergyResponse = await instance.get(`/menus/${menuId}/allergies`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAllergies(allergyResponse.data); // 알러지 정보 상태에 저장
        } catch (error) {
          console.error("Error fetching menu data:", error);
          setError("메뉴 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };

      getMenuData();
    } else {
      setError("잘못된 요청입니다.");
      setLoading(false);
    }
  }, [storeId, menuId]);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("업로드된 파일:", file);

        setForm({ ...form, newImageFile: file });
        setImagePreview(URL.createObjectURL(file)); // 미리보기 업데이트  
    }
  };

  const handlePreviewClick = () => {
    document.getElementById("newImageFile").click(); // 프리뷰 클릭 시 파일 선택 창 띄우기
  };

  // 저장 버튼 클릭 시 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("menuName", form.menuName);
    formData.append("menuPrice", form.menuPrice);
    formData.append("menuContents", form.menuContents);

    if (form.newImageFile) {
      formData.append("image", form.newImageFile); 
    }

    for (let [key, value] of formData.entries()) {
      console.log(`FormData - ${key}:`, value);
    }

    try {
      
      const response = await instance.put(`/stores/${storeId}/menus/${menuId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("서버 응답:", response.data);

      alert("메뉴 정보 수정 완료");
      navigate("/menu-manage");
    } catch (error) {
      console.error("Error occurred:", error);
      alert("메뉴 정보 수정에 실패했습니다.");
    }
  };

  const handleDeleteClick = async (storeId, menuId) => {
    try {
        console.log("삭제요청",storeId,menuId);
      const response = await instance.delete(`/stores/${storeId}/menus/${menuId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("삭제response:", response)

      alert("메뉴 삭제 성공");
      navigate("/menu-manage");

    } catch (error) {
      // 서버에서 에러 메시지가 있는 경우
      if (error.response && error.response.data && error.response.data.message) {
        // 서버에서 반환한 에러 메시지
        alert(`[메뉴삭제 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("메뉴삭제 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 알러지 카테고리 조회
  const handleClickAllergy = async () => {
    setIsModalOpen(true);
    try {
      const response = await instance.get("/allergies"); // 알러지 카테고리 조회 API
      setAllergyCategories(response.data); 
    } catch (error) {
      alert("알러지 카테고리 정보를 불러오지 못했습니다.");
    }
  };

  // 알러지 카테고리 선택 시 실행
  const handleAllergyCategoryChange = async (e) => {
    const categoryId = e.target.value;
    console.log(categoryId);
    setSelectedAllergyCategoryId(categoryId);

    if (categoryId) {
      try {
        const response = await instance.get(`/allergies/${categoryId}/allergyStuff`); // 선택한 카테고리에 속한 원재료 조회
        console.log("원재료 데이터:", response.data);
        setAllergyStuffs(response.data);
      } catch (error) {
        alert("알러지 원재료 정보를 불러오지 못했습니다.");
      }
    } else {
      setAllergyStuffs([]); // 선택이 해제되면 초기화
    }
  };

  // 알러지 원재료 선택 시 실행
  const handleAllergyStuffsChange = (e) => {
    setSelectedAllergyStuffs(e.target.value);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAllergyCategoryId(""); // 알러지 카테고리 초기화
    setSelectedAllergyStuffs(""); // 알러지 원재료 초기화
    setAllergyStuffs([]); // 원재료 목록 초기화
  };

  const handleSubmitAllergy = async () => {
    // 알러지 정보가 모두 선택되었는지 확인
    if (!selectedAllergyCategoryId || !selectedAllergyStuffs) {
      alert("알러지 카테고리와 원재료를 모두 선택해주세요.");
      return;
    }
  
    try {
      const token = localStorage.getItem("accessToken");
  
      // 알러지 정보를 메뉴에 추가하는 POST 요청
      const response = await instance.post(
        `/menus/${menuId}/allergies`,
        {
          allergyStuff: selectedAllergyStuffs,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // 요청 성공 시
      console.log("알러지 등록 성공:", response.data);

      // 알러지 목록 갱신
        const updatedAllergies = await instance.get(`/menus/${menuId}/allergies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllergies(updatedAllergies.data);
  
      // 알러지 카테고리와 원재료 선택 초기화
      setSelectedAllergyCategoryId("");
      setSelectedAllergyStuffs("");
      setAllergyStuffs([]); // 원재료 목록 초기화
  
      alert("알러지 정보가 등록되었습니다.");
      closeModal(); // 모달 닫기
    } catch (error) {
      console.error("알러지 등록 중 오류 발생:", error);
      alert("알러지 정보를 등록하는데 실패했습니다.");
    }
  };

  const handleClickDeleteAllergy = async(allergyId) => {
    try {
        const response = await instance.delete(`/menus/allergies/${allergyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        console.log("알러지 삭제 성공:", response.data);
        alert("알러지가 삭제되었습니다.");
    
        // 삭제된 항목을 제외한 새로운 리스트로 업데이트
        setAllergies((prevAllergies) =>
          prevAllergies.filter((allergy) => allergy.allergyId !== allergyId)
        );
      } catch (error) {
        console.error("알러지 삭제 중 오류 발생:", error);
        alert("알러지를 삭제하는데 실패했습니다.");
      }
  }

  const handleClickRecommended = async () => {
    try {
      // 대표 메뉴 변경 API 호출
      const response = await instance.patch(
        `/stores/${storeId}/menus/${menuId}`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // 대표 메뉴 변경 성공 시 화면 갱신
      alert(response.data); // 성공 메시지 표시
  
      // 상태 업데이트: 대표 메뉴 상태 변경
      setForm((prevForm) => ({
        ...prevForm,
        menuStatus: "RECOMMENDED", // 상태를 '대표'로 설정
      }));
      
      // 메뉴 상세 정보 갱신 (선택적으로 추가)
      const updatedMenuResponse = await instance.get(`/stores/${storeId}/menus/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setMenuDetails(updatedMenuResponse.data); // 최신 메뉴 정보로 갱신
  
    } catch (error) {
      console.error("대표 메뉴 변경 실패:", error);
      alert("대표 메뉴 변경에 실패했습니다.");
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
            <h1>메뉴 수정</h1>
          </div>

          {/* 이미지 미리보기 및 파일 업로드 */}
          <div className="register-preview-container">
            <input
              type="file"
              id="newImageFile"
              name="newImageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="register-file-input"
              style={{ display: "none" }}
            />
          </div>
          <div
            className="register-preview-container"
            onClick={handlePreviewClick} // 프리뷰 클릭 시 파일 선택 창 띄우기
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Menu Image"
                className="register-preview"
              />
            ) : (
              <span>이미지 선택</span>
            )}
          </div>

          {/* 메뉴 수정 입력 폼 */}
          {menuDetails && (
            <div className="menu-info">
              <label className="register-label">메뉴 이름</label>
              <input
                type="text"
                name="menuName"
                value={form.menuName}
                onChange={handleChange}
                className="menu-input"
              />

              <label className="register-label">대표메뉴 여부</label>
              <input
                type="text"
                name="menuStatus"
                value={statusMapping[form.menuStatus] || form.menuStatus}
                className="menu-input"
                readOnly
              />

              <label className="register-label">가격</label>
              <input
                type="text"
                name="menuPrice"
                value={form.menuPrice}
                onChange={handleChange}
                className="menu-input"
              />

              <label className="register-label">설명</label>
              <input
                type="text"
                name="menuContents"
                value={form.menuContents}
                onChange={handleChange}
                className="menu-input"
              />
            </div>
          )}
          {/* 알러지 정보 리스트 */}
          {allergies.length > 0 && (
            <div className="menu-info">
              <label className="register-label">알러지정보</label>
              <div className="allergy-list-container">
                {allergies.map((allergy) => (
                  <div className="allergy-list" key={allergy.allergyId}>
                    {allergy.allergyCategory} | {allergy.allergyStuff}
                    <button 
                    className="menu-mini-button"
                    onClick={() =>handleClickDeleteAllergy(allergy.allergyId)}>삭제</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!menuDetails && <p>메뉴를 선택해주세요.</p>}

          {/* 버튼 */}
          <div className="button-container">
            <button onClick={handleClickRecommended}>대표메뉴로 지정</button>
            <button onClick={handleClickAllergy}>알러지정보</button>
            <button onClick={handleSubmit}>저장</button>
            <button onClick={() =>handleDeleteClick(storeId,menuId)}>삭제</button>
          </div>

          {/* 모달 */}
          {isModalOpen && (
                <div className="modal-overlay">
                <div className="modal-content">
                    <h2>알러지정보</h2>
                    {/* 알러지 카테고리 선택 */}
                    <label className="register-label">카테고리</label>
                    <select 
                    value={selectedAllergyCategoryId} 
                    onChange={handleAllergyCategoryChange} 
                    className="search-criteria-dropdown">
                    <option value="">카테고리를 선택하세요</option>
                    {allergyCategories.map((category) => (
                        <option key={category.allergyCategoryId} value={category.allergyCategoryId}>
                        {category.allergyCategory}
                        </option>
                    ))}
                    </select>

                    {/* 알러지 원재료 선택 */}
                    <label className="register-label">원재료</label>
                    <select 
                    value={selectedAllergyStuffs} 
                    onChange={handleAllergyStuffsChange} 
                    disabled={!selectedAllergyCategoryId}
                    className="search-criteria-dropdown">
                    <option value="">원재료를 선택하세요</option>
                    {allergyStuffs.map((stuff) => (
                        <option key={stuff.allergyStuffId} value={stuff.allergyStuff}>
                        {stuff.allergyStuff}
                        </option>
                    ))}
                    </select>
                    <br /><br />
                    <div className="button-container">
                    <button onClick={handleSubmitAllergy}>저장</button>
                    <button onClick={closeModal}>닫기</button>
                    </div>
                </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ModifyMenu;
