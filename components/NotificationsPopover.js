import React, { useState, useEffect, useContext } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import { getAllNotifications, deleteNotification, markNotificationRead } from '@/app/services/notificationService';
import useLazyFetch from '@/app/hooks/useLazyFetch';
import dayjs from 'dayjs';
import { NotificationContext } from '@/app/context/NotificationContext';
import { message } from 'antd'; // or use the context notification

export default function NotificationsPopover({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const { setUnreadCount, unreadCount, openNotification } = useContext(NotificationContext);

    // API triggers
    const { trigger: fetchNotifications, loading } = useLazyFetch(getAllNotifications);
    const { trigger: triggerDelete } = useLazyFetch(deleteNotification);
    const { trigger: triggerMarkRead } = useLazyFetch(markNotificationRead);

    const loadNotifications = async () => {
        const params = {
            page: 1,
            limit: 10
        };
        const res = await fetchNotifications(params);
        if (res?.data?.success) {
            const { notifications, unreadCount, total } = res.data.data;
            setNotifications(notifications || []);
            setTotalNotifications(total || 0);
            setUnreadCount(unreadCount || 0);
        }
    };

    // Initial load
    useEffect(() => {
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMarkAllRead = async () => {
        // Optimistic UI update
        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updatedNotifications);
        setUnreadCount(0);

        const res = await triggerMarkRead({ notificationId: null }, {
            successMsg: true,
            errorMsg: true
        });
        if (!res?.data?.success) {
            // Revert or show error if needed, but usually silent fail or retry is okay for this
            // For now, let's just reload to be safe if it failed
            loadNotifications();
        } else {
            // If success, maybe reload to get true state if needed, or trust optimistic
            // loadNotifications(); // Optional
        }
    };

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation();
        // Optimistic update
        const updatedNotifications = notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(prev => Math.max(0, prev - 1));

        const res = await triggerMarkRead({ notificationId: id }, { successMsg: false, errorMsg: true }); // Silent success, loud error

        if (!res?.data?.success) {
            loadNotifications(); // Revert on failure
            openNotification?.("error", "Failed to mark as read");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        // Optimistic UI update
        const updatedNotifications = notifications.filter(n => n.id !== id);
        setNotifications(updatedNotifications);
        setTotalNotifications(prev => Math.max(0, prev - 1));

        // Check if the deleted one was unread, if so decrement count
        const deletedItem = notifications.find(n => n.id === id);
        if (deletedItem && !deletedItem.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        const res = await triggerDelete({ notificationId: id }, { successMsg: true, errorMsg: true });

        if (!res?.data?.success) {
            loadNotifications(); // Revert
        }
    };

    return (
        <div className="w-[400px] font-sans rounded-xl overflow-hidden shadow-lg bg-white">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 m-0">Notifications</h3>
                    <p className="text-slate-500 text-sm m-0 mt-0.5">All {totalNotifications} Notifications</p>
                </div>
                <div className="flex items-center gap-4">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-green-600 text-xs font-semibold hover:text-green-700 transition-colors"
                        >
                            Mark All Read
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                        <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-50 flex justify-between items-start gap-3 group transition-colors ${index % 2 !== 0 ? 'bg-[#e0f7fa]' : 'bg-white hover:bg-gray-50'
                                }`}


                        >
                            {!notif.isRead && (
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Unread"></div>
                            )}
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">{notif.title}</h4>
                                <p className="text-slate-600 text-sm mb-2 leading-relaxed">
                                    {notif.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-slate-400 text-xs font-medium">
                                        {notif.createdAt ? dayjs(notif.createdAt).format('MMM D, h:mm A') : '-'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {!notif.isRead && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(e, notif.id)}
                                                className="text-slate-400 hover:text-green-500 opacity-60 hover:opacity-100 transition-all p-1"
                                                title="Mark as Read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(e, notif.id)}
                                            className="text-slate-400 hover:text-red-500 opacity-60 hover:opacity-100 transition-all p-1"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-500">No notifications found</div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d4d4d8;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a1a1aa;
                }
            `}</style>
        </div>
    );
}
