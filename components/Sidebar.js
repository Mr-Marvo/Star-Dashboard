'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    AppstoreOutlined,
    UserOutlined,
    VideoCameraOutlined,
    TrophyOutlined,
    CreditCardOutlined,
    BarChartOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    TeamOutlined,
    RightOutlined,
    LeftOutlined
} from '@ant-design/icons';
import { logoutUser } from '@/app/services/authService';
import useLazyFetch from '@/app/hooks/useLazyFetch';
import { removeCookie, removeLocalStorageData } from '@/app/helpers/storageHelper';

const { Sider } = Layout;

export default function Sidebar({ collapsed, setCollapsed }) {
    const pathname = usePathname();
    const router = useRouter();
    const { trigger: triggerLogout } = useLazyFetch(logoutUser);

    const handleLogout = async () => {
        const res = await triggerLogout({}, { successMsg: true, errorMsg: true });
        if (res?.data?.success) {
            removeCookie("auth-token");
            removeLocalStorageData("userData");
            router.push("/login");
        }
    };

    const menuItems = [
        {
            key: '/',
            icon: <AppstoreOutlined />,
            label: <Link href="/">Overview</Link>,
        },
        {
            key: '/user-management',
            icon: <UserOutlined />,
            label: <Link href="/user-management">User Management</Link>,
        },
        {
            key: '/creator-management',
            icon: <TeamOutlined />,
            label: <Link href="/creator-management">Creator Management</Link>,
        },
        {
            key: '/campaign-management',
            icon: <TrophyOutlined />,
            label: <Link href="/campaign-management">Campaign Management</Link>,
        },
        {
            key: '/video-moderation',
            icon: <VideoCameraOutlined />,
            label: <Link href="/video-moderation">Video Moderation</Link>,
        },
        {
            key: '/subscriptions',
            icon: <CreditCardOutlined />,
            label: <Link href="/subscriptions">Subscriptions</Link>,
        },
        {
            key: '/analytics',
            icon: <BarChartOutlined />,
            label: <Link href="/analytics">Analytics</Link>,
        },
        {
            key: '/winners',
            icon: <TrophyOutlined />,
            label: <Link href="/winners">Winners</Link>,
        },

        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: <Link href="/settings">Settings</Link>,
        },
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            breakpoint="md"
            collapsedWidth="80"
            onBreakpoint={(broken) => {
                if (broken) {
                    setCollapsed(true);
                }
            }}
            className="h-screen !bg-[#2a0036] border-r border-white/10"
            width={260}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
                background: '#2a0036', // Fallback
            }}
        >
            <div className="flex flex-col h-full">
                {/* Logo Area */}
                <div className={`flex items-center p-4 h-20 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                    {!collapsed && (
                        <div>
                            <h1 className="text-white font-bold text-xl">Voice Star</h1>
                            <p className="text-white/50 text-xs">Super Admin</p>
                        </div>
                    )}
                    <Button
                        type="text"
                        icon={collapsed ? <RightOutlined style={{ color: 'white' }} /> : <LeftOutlined style={{ color: 'white' }} />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="hover:bg-white/10"
                    />
                </div>

                {/* Menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    className="flex-1 !bg-transparent border-none px-2"
                    style={{
                        background: 'transparent',
                    }}
                />

                {/* Logout */}
                <div className="p-4 border-t border-white/10">
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectable={false}
                        className="!bg-transparent border-none"
                        onClick={({ key }) => {
                            if (key === 'logout') {
                                handleLogout();
                            }
                        }}
                        items={[
                            {
                                key: 'logout',
                                icon: <LogoutOutlined />,
                                label: 'Logout',
                                className: 'text-white/70 hover:text-white',
                            }
                        ]}
                    />
                </div>
            </div>
            <style jsx global>{`
        .ant-menu-item {
           margin-bottom: 8px !important;
           border-radius: 8px !important;
           color: rgba(255, 255, 255, 0.7) !important;
        }
        .ant-menu-item-selected {
           background-color: #8b0000 !important; /* Dark Red/Pink from image */
           background: linear-gradient(90deg, #a6009d 0%, #8b0000 100%) !important;
           color: white !important;
        }
        .ant-menu-item:hover {
           color: white !important;
           background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ant-layout-sider {
           background: #2a0036 !important;
        }
      `}</style>
        </Sider>
    );
}
