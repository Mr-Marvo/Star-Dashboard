import { decrypt } from "./encryptionHelper";
import { encrypt } from "./encryptionHelper";
import Cookies from "js-cookie";

export function setLocalStorageData(key, data) {
  if (typeof window !== "undefined") {
    const encryptedData = encrypt(data);
    localStorage.setItem(key, encryptedData);
  }
}

export function getLocalStoragedata(key) {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    if (data !== null) {
      return decrypt(data);
    }
  }
  return null;
}

export function removeLocalStorageData(key) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}

export const removeCookie = (name) => {
  Cookies.remove(name);
};

export const removeAllCookies = () => {
  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach((cookieName) => {
    Cookies.remove(cookieName);
  });
};
