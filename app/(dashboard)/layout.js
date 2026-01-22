'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const { Content } = Layout;

import { UserContextProvider } from '@/app/context/UserContext';
import { NotificationContextProvider } from '@/app/context/NotificationContext'; // Assuming this might be needed or already wrapped at root, but user asked for context. Let's wrap here to be safe or check root layout.
// Actually, looking at file content, I don't see NotificationContext used here.
// But I should wrap UserContextProvider inside the layout so Sidebar has access.

export default function DashboardLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <UserContextProvider>
            <Layout className="min-h-screen">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <Layout
                    style={{
                        marginLeft: collapsed ? 80 : 260,
                        transition: 'all 0.2s',
                        minHeight: '100vh'
                    }}
                >
                    <Header collapsed={collapsed} />
                    <Content
                        className="p-6 bg-white  text-black "
                        style={{
                            margin: 0,
                            minHeight: 280,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </UserContextProvider>
    );
}

