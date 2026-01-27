"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Input, Button, Avatar, Spin, Modal } from "antd";
import { Search, Ban, CheckCircle } from "lucide-react";
import CustomTable from "@/components/CustomTable";
import CustomPagination from "@/components/CustomPagination";
import UserDetailsModal from "@/components/UserDetailsModal";
import { UserOutlined } from "@ant-design/icons";
import { getUsers, banUser, activateUser } from "@/app/services/userService";
import useDebounce from "@/app/hooks/useDebounce";
import useLazyFetch from "@/app/hooks/useLazyFetch";
import dayjs from "dayjs";

const { TabPane } = Tabs;

export default function UserManagementPage() {
    const [activeTab, setActiveTab] = useState("1");
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState({ banned: 0, reported: 0, totalUsers: 0 });

    // API Hooks
    const { trigger: triggerBan } = useLazyFetch(banUser);
    const { trigger: triggerActivate } = useLazyFetch(activateUser);
    const [modal, contextHolder] = Modal.useModal();

    const debouncedSearch = useDebounce(searchText, 500);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let userStatus = "";
            if (activeTab === "2") userStatus = "BANNED";
            if (activeTab === "3") userStatus = "REPORTED";

            const response = await getUsers(currentPage, 10, debouncedSearch, userStatus);
            if (response.data.success) {
                const { data, total, banned, reported } = response.data.data;
                setUsers(data);
                setTotal(total);

                setStats({
                    totalUsers: response.data.data.totalUsers,
                    banned: banned,
                    reported: reported
                });
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearch, activeTab]);

    const handleBan = (record) => {
        modal.confirm({
            title: 'Ban User',
            content: 'Are you sure you want to ban this user? They will not be able to access the platform.',
            okText: 'Ban',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                const res = await triggerBan({ userId: record.userId }, {
                    successMsg: true,
                    errorMsg: true
                });

                if (res?.data?.success) {
                    fetchUsers();
                    if (isModalOpen && selectedUser?.userId === record.userId) {
                        setIsModalOpen(false);
                    }
                }
            }
        });
    };

    const handleActivate = (record) => {
        modal.confirm({
            title: 'Activate User',
            content: 'Are you sure you want to activate this user?',
            okText: 'Activate',
            cancelText: 'Cancel',
            onOk: async () => {
                const res = await triggerActivate({ userId: record.userId }, {
                    successMsg: true,
                    errorMsg: true
                });

                if (res?.data?.success) {
                    fetchUsers(); // Refresh list
                    if (isModalOpen && selectedUser?.userId === record.userId) {
                        setIsModalOpen(false);
                    }
                }
            }
        });
    };


    const handleRowClick = (record) => {
        setSelectedUser(record);
        setIsModalOpen(true);
    };

    const getSubscriptionColor = (sub) => {
        const s = sub?.toLowerCase();
        if (s === 'gold') return '#EAB308';
        if (s === 'silver') return '#94A3B8';
        if (s === 'platinum') return '#A855F7';
        return '#cbd5e1';
    };

    const columns = [
        {
            title: "User",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Avatar size="large" icon={<UserOutlined />} src={record.profilePicture || null} className="bg-gray-200" />
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                            {(text || record.userName)?.length > 15 ? (text || record.userName).substring(0, 15) + "..." : (text || record.userName)}
                        </span>
                        <span className="text-xs text-gray-400">
                            @{(record.userName)?.length > 20 ? record.userName.substring(0, 20) + "..." : record.userName}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: "Subscription",
            dataIndex: "subscription",
            key: "subscription",
            render: (text) => (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getSubscriptionColor(text) }}></span>
                    <span className="text-gray-600 capitalize">{text || 'Free'}</span>
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const isActive = status === "ACTIVE";
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${isActive
                            ? "bg-green-100 text-green-600 border-green-200"
                            : "bg-red-100 text-red-600 border-red-200"
                            }`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            title: "Joined",
            dataIndex: "joinedAt",
            key: "joinedAt",
            render: (text) => <span className="text-gray-500">{text ? dayjs(text).format('MM/DD/YYYY') : 'N/A'}</span>,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => {
                const isBanned = record.status === 'BANNED' || record.status === 'BLOCKED';
                if (isBanned) {
                    return (
                        <Button
                            size="small"
                            className="flex items-center gap-1 !bg-green-50 hover:!bg-green-100 border-green-200 text-green-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleActivate(record);
                            }}
                        >
                            <CheckCircle size={14} /> Activate
                        </Button>
                    );
                }

                if (record.status === 'DELETED') {
                    return null;
                }

                return (
                    <Button
                        danger
                        size="small"
                        className="flex items-center gap-1 !bg-red-50 hover:!bg-red-100 border-red-200 text-red-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleBan(record);
                        }}
                    >
                        <Ban size={14} /> Ban
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {contextHolder}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="text-slate-500">Manage platform users and their accounts</p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <Tabs
                    defaultActiveKey="1"
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key);
                        setCurrentPage(1);
                    }}
                    className="custom-tabs gap-1"
                    items={[

                        { key: '1', label: `All Users ${stats.totalUsers ? `(${stats.totalUsers})` : ''}` },
                        { key: '2', label: `Banned ${stats.banned ? `(${stats.banned})` : ''}` },
                        // { key: '3', label: `Reported ${stats.reported ? `(${stats.reported})` : ''}` },
                    ]}
                />

                {/* Search */}
                <Input
                    prefix={<Search className="text-gray-400" size={18} />}
                    placeholder="Search by username"
                    className="!bg-[#f9fafb] !border-none !h-12 !text-base !rounded-lg"
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spin size="large" />
                </div>
            ) : (
                <CustomTable
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: 'pointer' }
                    })}
                    rowKey="userId"
                />
            )}

            {!loading && total > 10 && (
                <div className="flex justify-end mt-4">
                    <CustomPagination
                        current={currentPage}
                        total={total}
                        pageSize={10}
                        onChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}

            <UserDetailsModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onBan={(user) => handleBan(user)}
                onActivate={(user) => handleActivate(user)}
            />
        </div>
    );
}
