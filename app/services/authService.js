import { authorizedAxiosInstance, authorizedAxiosInstancewithBear } from "@/app/helpers/axiosInstance";


export const loginUser = async (data) => {
  return authorizedAxiosInstance.post("/auth/admin/sign-in", data);
};

export const logoutUser = async () => {
  return authorizedAxiosInstance.get("/auth/admin/sign-out");
};

export const authAdmin = async () => {
  return authorizedAxiosInstancewithBear.get("/auth/admin/auth");
};


