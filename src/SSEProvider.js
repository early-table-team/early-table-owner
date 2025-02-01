import React, { createContext, useEffect, useState, useContext } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import instance from "./api/axios"; // Axios 인스턴스
import { useNavigate } from "react-router-dom";

const SSEContext = createContext();

export const SSEProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getRefreshToken = async () => {
      try {
        console.log("🔄 토큰 갱신 시도...");

        const response = await instance.post(
          "/users/refresh",
          {}, // body 없음
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true, // 브라우저가 HttpOnly 쿠키 자동 전송
          }
        );

        const newAccessToken = response.data.accessToken;

        if (
          newAccessToken === null ||
          newAccessToken === "undefined" ||
          !newAccessToken
        ) {
          navigate("/login");
          return;
        }

        localStorage.setItem("accessToken", newAccessToken);

        console.log("✅ 토큰 갱신 성공, SSE 재연결...");
        eventSource.close();
        connectSSE(); // 토큰 갱신 후 SSE 재연결
      } catch (err) {
        console.log("❌ 토큰 갱신 실패, 로그인 페이지로 이동");
        eventSource.close();
        navigate("/login");
      }
    };

    const connectSSE = () => {
      const eventSource = new EventSourcePolyfill(
        "http://localhost:8080/notifications/subscribe",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true, // 쿠키 자동 전송
          heartbeatTimeout: 600000,
        }
      );

      eventSource.onopen = () => console.log("✅ SSE 연결 성공");

      const handleMessage = (event) => {
        setMessages((prev) => [...prev, event]);
      };

      const eventTypes = [
        "STORE_VIEW",
        "INIT",
        "PARTY",
        "RESERVATION",
        "WAITING",
        "FRIEND",
        "REVIEW",
        "NOTICE",
        "MESSAGE",
      ];

      eventTypes.forEach((type) =>
        eventSource.addEventListener(type, handleMessage)
      );

      eventSource.onerror = async (error) => {
        console.log("❌ SSE 에러 발생:", error);
        eventSource.close();
        navigate("/login");
      };

      return eventSource;
    };

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken || accessToken === "undefined") {
      console.log(accessToken);
      getRefreshToken();
    }

    const eventSource = connectSSE();

    return () => {
      eventSource.close();
    };
  }, [navigate]);

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <SSEContext.Provider value={{ messages, clearMessages }}>
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => useContext(SSEContext);
