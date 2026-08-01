import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// إضافة التوكن إلى كل طلب تلقائيًا
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;