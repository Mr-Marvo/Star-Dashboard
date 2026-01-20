'use client';

import React, { useState } from 'react';
import { Layout, Badge, Popover } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationsPopover from '@/components/NotificationsPopover';
import { useContext } from 'react';
import { NotificationContext } from '@/app/context/NotificationContext';

const { Header: AntHeader } = Layout;

export default function Header({ collapsed }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { unreadCount } = useContext(NotificationContext);

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const getTitle = () => {
        switch (pathname) {
            case '/':
                return 'Dashboard Overview';
            case '/user-management':
                return 'User Management';
            case '/creator-management':
                return 'Creator Management';
            case '/campaign-management':
                return 'Campaign Management';
            case '/video-moderation':
                return 'Video Moderation';
            case '/subscriptions':
                return 'Subscriptions';
            case '/analytics':
                return 'Analytics';
            case '/winners':
                return 'Winners';
            case '/settings':
                return 'Settings';
            default:
                return 'Dashboard';
        }
    };

    return (
        <AntHeader
            className="flex items-center justify-between px-6 bg-white border-b border-gray-200 sticky top-0 z-50"
            style={{
                padding: '0 24px',
                background: 'white',
                height: '80px',
            }}
        >
            <div>
                <h2 className="text-xl font-bold text-black m-0">
                    {getTitle()}
                </h2>
                <p className="text-gray-500 text-sm m-0 hidden sm:block">
                    Welcome back! Here&apos;s what&apos;s happening with Voice Star today.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <Popover
                    content={<NotificationsPopover onClose={() => setOpen(false)} />}
                    trigger="click"
                    open={open}
                    onOpenChange={handleOpenChange}
                    placement="bottomRight"
                    styles={{ body: { padding: 0 } }}
                >
                    <Badge count={unreadCount} size="small">
                        <BellOutlined style={{ color: 'black' }} className="text-xl text-gray-600 cursor-pointer" />
                    </Badge>
                </Popover>
                {/* <Avatar icon={<UserOutlined />} className="bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer" /> */}
            </div>
        </AntHeader>
    );
}
