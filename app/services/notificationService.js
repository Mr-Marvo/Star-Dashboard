import { authorizedAxiosInstance } from "../helpers/axiosInstance";

export const getAllNotifications = async (params) => {
    return authorizedAxiosInstance.get("/admin-notification/fetch-notifications/all", { params });
};

export const deleteNotification = async (data) => {
    return authorizedAxiosInstance.post("/admin-notification/remove-notification", data);
};

export const markNotificationRead = async (data) => {
    return authorizedAxiosInstance.post("/admin-notification/mark-notification-read", data);
};




