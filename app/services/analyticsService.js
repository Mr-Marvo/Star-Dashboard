import { authorizedAxiosInstance } from "@/app/helpers/axiosInstance";

export const getAnalytics = async (lastDays = 30) => {
    return authorizedAxiosInstance.get("/admin/get-analytics", {
        params: {
            lastDays
        }
    });
};
