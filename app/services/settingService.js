import { authorizedAxiosInstance } from "../helpers/axiosInstance";

export const updateNotificationSettings = async (data) => {
    return authorizedAxiosInstance.post("/admin/update-notification-type", data);
};

export const changePassword = async (data) => {
    return authorizedAxiosInstance.post("/admin/change-password", data);
};

export const updateProfileInformation = async (data) => {
    return authorizedAxiosInstance.put("/admin/update-profile-information", data);
};
