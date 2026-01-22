
import { authorizedAxiosInstance } from "../helpers/axiosInstance";

export const getSubscriptionStaticData = async () => {
    try {
        const result = await authorizedAxiosInstance.get(`/subscription/admin/get-subscription-static-data`);
        return result;
    } catch (error) {
        console.error("Error getting static data", error);
        throw error;
    }
}

export const getAllSubscriptions = async (params) => {
    return authorizedAxiosInstance.get(`/subscription/admin/get-all-subscriptions`, { params });
};

export const cancelSubscription = async (data) => {
    return authorizedAxiosInstance.post(`/subscription/admin/cancel-subscription`, data);
};
