"use client";
import React from "react";
import { Modal, Tabs, Button, Avatar, Input, Tag } from "antd";
import { UserOutlined, StopOutlined, WarningOutlined, CheckCircleOutlined, CrownFilled } from "@ant-design/icons";
import dayjs from "dayjs";

const UserDetailsModal = ({ open, onClose, user, onBan, onActivate }) => {
    if (!user) return null;

    const getSubscriptionStyle = (sub) => {
        const s = (sub || "").toLowerCase();
        if (s === 'gold') return "border-yellow-500 text-yellow-500 bg-yellow-50";
        if (s === 'silver') return "border-slate-300 text-slate-700 bg-slate-100";
        if (s === 'platinum') return "border-purple-200 text-purple-700 bg-purple-50";
        return "border-gray-200 text-gray-600 bg-gray-100";
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
            title={null}
            closeIcon={null}
            className="user-details-modal !p-0"
            centered
        >
            {/* Header */}
            <div className="flex items-start justify-between relative !bg-[#E7FFEB] p-6">
                <div className="flex items-center gap-4">
                    <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        src={user.profilePicture || null}
                        className="bg-[#C00F75]"
                        style={{ backgroundColor: '#C00F75' }}
                    />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 m-0">{user.name}</h2>
                        <p className="text-gray-500 m-0">@{user.userName}</p>
                        <div className="mt-2">
                            <span className={`flex items-center w-fit p-1  px-2 rounded-lg font-medium border capitalize ${getSubscriptionStyle(user.subscription)}`}>
                                <CrownFilled className="mr-1" /> {user.subscription || "Free"}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 absolute top-4 right-4 p-2 font-bold"
                >
                    ✕
                </button>
            </div>

            {/* Tabs */}
            <Tabs
                defaultActiveKey="profile"
                items={[
                    {
                        key: 'profile',
                        label: 'Profile',
                        children: (
                            <div className="py-4">
                                <h3 className="text-lg font-bold mb-4">Account Information</h3>

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium">
                                            {user.mobile ? `+94 ${user.mobile}` : "N/A"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">User Name</label>
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium">
                                            @{user.userName}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Member Since</label>
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium">
                                            {user.joinedAt ? dayjs(user.joinedAt).format('MM/DD/YYYY') : "N/A"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Last Active</label>
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium">
                                            {user.lastActive ? dayjs(user.lastActive).format('MM/DD/YYYY') : "N/A"}
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="mb-8">
                                    <h3 className="text-lg font-bold mb-4">Subscription Tier</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {['Free', 'Silver', 'Gold', 'Platinum'].map((tier) => {
                                            const userSub = user?.subscription ? String(user.subscription) : "Free";
                                            const isActive = userSub.toLowerCase() === tier.toLowerCase();

                                            let activeClass = "";
                                            if (tier === 'Gold') activeClass = "border-yellow-200 text-yellow-700 bg-yellow-50";
                                            else if (tier === 'Silver') activeClass = "border-slate-300 text-slate-700 bg-slate-100";
                                            else if (tier === 'Platinum') activeClass = "border-purple-200 text-purple-700 bg-purple-50";
                                            else activeClass = "border-gray-200 text-gray-600 bg-white";

                                            const finalClass = isActive
                                                ? activeClass
                                                : "border-gray-100 text-gray-400 bg-gray-50 opacity-60";

                                            return (
                                                <div
                                                    key={tier}
                                                    className={`text-center py-3 rounded-lg font-medium border ${finalClass}`}
                                                >
                                                    {tier}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div> */}

                                {user?.status !== 'DELETED' && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Account Actions</h3>
                                        <div className="flex flex-col gap-4">
                                            {user?.status === 'BANNED' || user?.status === 'BLOCKED' ? (
                                                <Button
                                                    className="!h-12 !bg-[#00D222] !text-white !border-none hover:!bg-[#00D222]/80 flex items-center justify-center gap-2 font-medium"
                                                    block
                                                    onClick={() => onActivate(user)}
                                                >
                                                    <CheckCircleOutlined /> Active User
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="!h-12 !bg-red-400 !text-white !border-none hover:!bg-red-500 flex items-center justify-center gap-2 font-medium"
                                                    block
                                                    danger
                                                    onClick={() => onBan(user)}
                                                >
                                                    <StopOutlined /> Ban User
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    // {
                    //     key: 'activity',
                    //     label: 'Activity',
                    //     children: (
                    //         <div className="py-8 text-center text-gray-500">
                    //             <p>Activity content loading...</p>
                    //             <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    //                 <p>Recent logins, page views, and interactions will be listed here.</p>
                    //             </div>
                    //         </div>
                    //     ),
                    // },
                    // {
                    //     key: 'subscription',
                    //     label: 'Subscription',
                    //     children: (
                    //         <div className="py-8 text-center text-gray-500">
                    //             <p>Subscription history loading...</p>
                    //             <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    //                 <p>Invoices, payment methods, and billing history.</p>
                    //             </div>
                    //         </div>
                    //     ),
                    // },
                ]}
            />

            <style jsx global>{`
        .user-details-modal .ant-modal-content {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
        }
        .user-details-modal .ant-tabs-nav {
          margin-bottom: 0;
          border-bottom: 1px solid #f0f0f0;
          padding: 0 24px;
        }
        .user-details-modal .ant-tabs-content {
          padding: 0 24px 24px;
        }
        .user-details-modal .ant-tabs-tab {
          padding: 12px 16px;
          font-size: 16px;
          color: #6B7280;
        }
        .user-details-modal .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #10B981 !important; /* Green active tab color */
          font-weight: 500;
        }
        .user-details-modal .ant-tabs-ink-bar {
          background: #10B981 !important;
        }
        /* Custom close button in header overrides default */
        .user-details-modal .ant-modal-close {
          display: none;
        }
      `}</style>
        </Modal>
    );
};

export default UserDetailsModal;
