import axios from "axios";
import { getCookie } from "./storageHelper";

export const authorizedAxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getCookie('auth-token')}`
    },
});

export const authorizedAxiosInstancewithBear = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getCookie('auth-token')}`
    },
});


export const authorizedFileUploadAxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${getCookie('auth-token')}`
    },
});