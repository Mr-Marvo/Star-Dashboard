'use client';

import React, { createContext, useState, useEffect } from "react";
import useLazyFetch from "@/app/hooks/useLazyFetch";
import { authAdmin } from "@/app/services/authService";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const { trigger: getUser, loading } = useLazyFetch(authAdmin);

    const fetchUser = async () => {
        const response = await getUser();
        if (response?.data?.success) {
            setUser(response.data.data);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                fetchUser,
                loading
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
