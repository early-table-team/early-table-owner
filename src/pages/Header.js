import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import { useSSE } from "../SSEProvider.js"; // SSE Context 사용
import "./css/Header.css"; // CSS 파일 불러오기


const Header = () => {
  const navigate = useNavigate();
  const { messages } = useSSE(); // 전역 메시지 가져오기
  const [count, setCount] = useState(0);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.type !== "STORE_VIEW" && message.type !== "INIT") {
        setCount((prevCount) => prevCount + 1); // 이전 카운트 기반으로 업데이트
      }
    });
  }, [messages]);

  return (
    <header>
      <div className="logo-title">
        <img src={require("../assets/company-logo.png")} alt="Logo" style={{ height: "40px" }} />
        <h2>얼리 테이블</h2>
      </div>

      <button>
        <img src={require("../assets/icon-store.png")} alt="" style={{ height: "40px" }} />
        <h4>가게 관리</h4>
      </button>
      <button>
        <img src={require("../assets/icon-menu.png")} alt="Logo" style={{ height: "40px" }} />
        <h4>메뉴 관리</h4>
      </button>
      <button>
        <img src={require("../assets/icon-reservation.png")} alt="Logo" style={{ height: "40px" }} />
        <h4>예약 내역</h4>
      </button>
      <button>
        <img src={require("../assets/icon-waiting.png")} alt="Logo" style={{ height: "40px" }} />
        <h4>웨이팅 내역</h4>
      </button>
      <button>
        <img src={require("../assets/icon-setting.png")} alt="Logo" style={{ height: "40px" }} />
        <h4>예약 설정</h4>
      </button>
      <button>
        <img src={require("../assets/icon-setting.png")} alt="Logo" style={{ height: "40px" }} />
        <h4>웨이팅 설정</h4>
      </button>
      <button>
        <img src={require("../assets/icon-store.png")} alt="Logo" style={{ height: "40px" }} />
        <h4>리뷰 관리</h4>
      </button>



      {/* <div className="nav">
        <Link to="/interest" className="login-link">
          <button>⭐</button>
        </Link>
        <Link to="/notification" className="login-link notification-icon">
          <button>🔔</button>
          {count > 0 && (
            <span className="notification-badge">{count}</span> // 카운트 표시
          )}
        </Link>
      </div> */}
    </header>
  );
};

export default Header;
