import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080", // Spring Boot 서버 주소
  withCredentials: true, // 쿠키를 포함하여 서버와 통신
});

instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 및 _retry 방지 조건 확인
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 방지 플래그 설정

      try {
        const response = await instance.post(
          "users/refresh",
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("accessToken"),
            },
            withCredentials: true,
          }
        );

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // 새 토큰으로 기존 요청 헤더 갱신
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest); // 요청 재시도
      } catch (err) {
        // 리프레시 실패 시 로그인 페이지로 이동
        //window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
