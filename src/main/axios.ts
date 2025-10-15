import axios from "axios"
import { get } from "./store"

const axiosInstance = axios.create({
  timeout: 5 * 60 * 1000,
  headers: {
    "Content-Type": "application/json",
  },
})

const axiosInstanceForPromAPI = axios.create({
  baseURL: "https://my.prom.ua/api/v1/",
  timeout: 2 * 60 * 1000,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstanceForPromAPI.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${get("promApiKey")}`
    return config
  },
)

export { axiosInstanceForPromAPI, axiosInstance }
