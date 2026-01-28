import { authorizedAxiosInstance } from "@/app/helpers/axiosInstance";

export const getDashboardAnalyticsCounts = async () => {
    return authorizedAxiosInstance.get("/admin/get-analytics-counts");
};

export const getSubscriptionGrowths = async (data) => {
    return authorizedAxiosInstance.post("/admin/get-subscription-growths", data);
};
