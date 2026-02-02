"use client";

import { ConfigProvider, notification } from "antd";
import { createContext, useState } from "react";
import { Check, CircleX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getAllNotifications } from "../services/notificationService";
import { useEffect } from "react";

export const NotificationContext = createContext({});

export function NotificationContextProvider({ children }) {
    const [api, contextHolder] = notification.useNotification();
    const [isShown, setIsShown] = useState(false); //401 issue
    const [unreadCount, setUnreadCount] = useState(0);
    const placement = "bottomLeft";
    const router = useRouter();
    const pathname = usePathname();

    // Poll for notifications
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!pathname) return;
            // Skip fetching on auth pages
            if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/sign-up')) {
                return;
            }

            try {
                const response = await getAllNotifications({ page: 1, limit: 1 });
                if (response?.data?.success) {
                    setUnreadCount(response.data.data.unreadCount || 0);
                }
            } catch (error) {
                console.error("Failed to poll notifications:", error);
            }
        };

        // Initial fetch
        fetchUnreadCount();

        // Set interval for polling (every 30 seconds)
        const intervalId = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(intervalId);
    }, [pathname]);

    const openNotification = (type, title, description, key) => {
        let backgroundColor = "";
        let textColor = "";

        if (type === "success") {
            backgroundColor = "#3c0563ff";
            textColor = "#FFFFFF";
        } else if (type === "warning") {
            backgroundColor = "#ed6e68";
            textColor = "#FFFFFF";
        } else {
            backgroundColor = "#EF4444";
            textColor = "#FFFFFF";
        }

        api[type]({
            style: {
                backgroundColor,
                color: textColor,
                paddingBottom: "14px",
                paddingTop: "14px",
            },
            title: <span style={{ color: textColor }}>{title}</span>,
            description: description && (
                <span style={{ color: textColor }}>{description}</span>
            ),
            key: key,
            icon:
                type === "success" ? (
                    <Check className="text-white" />
                ) : (
                    <CircleX className="text-white" />
                ),
            placement,
        });
    };

    const handleError = (error) => {
        if (error.code === "ERR_NETWORK") {
            openNotification("error", "Network Error!", null, "handleError");
        } else if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                if (!isShown) {
                    setIsShown(true);
                    localStorage.removeItem("userData");
                    localStorage.removeItem("token");
                    openNotification("warning", "Session expired!");
                    router.push(`/login`);
                }
            } else if (error.response.status === 404) {
                openNotification("error", error.message, null, "handleError");
            } else if (error.response.status === 500) {
                openNotification(
                    "error",
                    "Internal Server Error!",
                    null,
                    "handleError"
                );
            } else if (error.response.status === 503) {
                window.location.replace("/under-maintenance");
            } else {
                openNotification("error", "Something went wrong", null, "handleError");
            }
        } else if (error.code === "ERR_BAD_REQUEST") {
            openNotification("error", error?.message, null, "handleError");
        } else {
            // Fallback for other errors
            openNotification("error", error?.message || "An error occurred", null, "handleError");
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                openNotification,
                handleError,
                unreadCount,
                setUnreadCount
            }}
        >
            <ConfigProvider
                notification={{
                    placement: "bottomLeft",
                    stack: true,
                    style: { zIndex: 200000 },
                }}
                theme={{
                    components: {
                        Notification: {
                            paddingMD: 15,
                            colorIcon: "rgb(255, 255, 255)",
                            colorTextHeading: "rgba(254, 254, 254, 0.88)",
                            colorIconHover: "rgb(255, 255, 255)",
                        },
                    },
                }}
            >
                {contextHolder}
                {children}
            </ConfigProvider>
        </NotificationContext.Provider>
    );
}
