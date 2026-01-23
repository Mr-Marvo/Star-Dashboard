'use client';

import React, { createContext, useState, useEffect } from "react";
import useLazyFetch from "@/app/hooks/useLazyFetch";
import { authAdmin } from "@/app/services/authService";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const { trigger: getUser, loading } = useLazyFetch(authAdmin);

    const getUserRef = React.useRef(getUser);
    getUserRef.current = getUser;

    const fetchUser = React.useCallback(async () => {
        try {
            const response = await getUserRef.current();
            if (response?.data?.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch user in context:", error);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const timer = setTimeout(() => {
            if (mounted) fetchUser();
        }, 0);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
