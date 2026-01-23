'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, CreditCard, Search, Bell } from 'lucide-react';
import CustomTable from '@/components/CustomTable';

import useLazyFetch from '@/app/hooks/useLazyFetch';
import { getSubscriptionStaticData, getAllSubscriptions, cancelSubscription } from '@/app/services/subscriptionService';
import { Modal, message } from 'antd';
import CustomPagination from '@/components/CustomPagination';


export default function SubscriptionsPage() {
    const [modal, modalContextHolder] = Modal.useModal();
    const [activeTab, setActiveTab] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [stats, setStats] = useState({
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        growthRate: 0,
        churned: 0
    });

    // List State
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        total: 0
    });

    const { trigger: cancelSub } = useLazyFetch(cancelSubscription);
    const { trigger: getStaticData } = useLazyFetch(getSubscriptionStaticData);

    const fetchStaticData = React.useCallback(async () => {
        try {
            const response = await getStaticData({});
            if (response?.data?.success) {
                const apiData = response.data.data;
                setStats({
                    ...apiData,
                    activeSubscriptions: apiData.activeSubcriptions || 0
                });
            }
        } catch (error) {
            console.error("Error fetching static data", error);
        }
    }, [getStaticData]);

    useEffect(() => {
        fetchStaticData();
    }, [fetchStaticData]);

    // Fetch Subscriptions List
    const fetchSubscriptions = React.useCallback(async () => {
        setLoading(true);
        try {
            const statusMap = {
                'all': '',
                'active': 'ACTIVE',
                'cancelled': 'CANCELLED',
                'expired': 'EXPIRED'
            };

            const params = {
                page: pagination.page,
                perPage: pagination.perPage,
                status: statusMap[activeTab] || '',
                search: searchText
            };

            const response = await getAllSubscriptions(params);

            if (response?.data?.success) {
                const { data: listData, total, page, perPage } = response.data.data;
                setSubscriptions(listData);
                setPagination(prev => ({
                    ...prev,
                    page,
                    perPage,
                    total
                }));
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions', error);
            // message.error('Failed to load subscriptions'); 
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.perPage, activeTab, searchText]);

    // Debounce search and effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscriptions();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, searchText, pagination.page, fetchSubscriptions]); // Depend on page, tab, search

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleCancelSubscription = (subscriptionId) => {
        modal.confirm({
            title: 'Cancel Subscription',
            content: 'Are you sure you want to cancel this subscription?',
            okText: 'Yes, Cancel',
            okType: 'danger',
            cancelText: 'No',
            centered: true,
            onOk: async () => {
                const response = await cancelSub({ subscriptionId }, { successMsg: true, errorMsg: true });
                if (response?.data?.success) {
                    fetchSubscriptions(); // Refresh list
                }
            }
        });
    };


    const columns = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (text) => <span className="text-gray-600 font-medium">{text}</span>
        },
        {
            title: 'Tier',
            dataIndex: 'subscriptionPlan',
            key: 'subscriptionPlan',
            render: (tier) => <TierBadge tier={tier?.charAt(0).toUpperCase() + tier?.slice(1)} />
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span className="font-medium text-green-600">
                    ${amount}<span className="text-gray-400 text-xs font-normal ml-1">per month</span>
                </span>
            )
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Expire',
            dataIndex: 'expire',
            key: 'expire',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusBadge status={status} />
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                record.status !== 'CANCELLED' && (
                    <button
                        onClick={() => handleCancelSubscription(record.subscriptionId)}
                        className="bg-red-100 text-red-500 border border-red-500 px-4 py-1.5 rounded-md text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                        Cancel
                    </button>
                )
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white p-6 lg:p-8">
            {modalContextHolder}


            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1e1e2d]">Subscription Management</h2>
                <p className="text-gray-500">Monitor and manage user subscriptions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Monthly Revenue"
                    value={`$${stats.monthlyRevenue}`}
                    icon={<DollarSign size={24} className="text-white" />}
                    iconBg="bg-green-500"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions}
                    icon={<Users size={24} className="text-white" />}
                    iconBg="bg-blue-600"
                />
                <StatCard
                    title="Growth Rate"
                    value={`+${stats.growthRate}%`}
                    icon={<TrendingUp size={24} className="text-white" />}
                    iconBg="bg-orange-500"
                />
                <StatCard
                    title="Churned"
                    value={stats.churned}
                    icon={<CreditCard size={24} className="text-white" />}
                    iconBg="bg-red-500"
                />
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <TabButton
                    label="All Subscriptions"
                    isActive={activeTab === 'all'}
                    onClick={() => { setActiveTab('all'); setPagination(p => ({ ...p, page: 1 })); }}
                />
                <TabButton
                    label="Active"
                    isActive={activeTab === 'active'}
                    variant="outline"
                    onClick={() => { setActiveTab('active'); setPagination(p => ({ ...p, page: 1 })); }}
                />
                <TabButton
                    label="Cancelled"
                    isActive={activeTab === 'cancelled'}
                    variant="outline"
                    onClick={() => { setActiveTab('cancelled'); setPagination(p => ({ ...p, page: 1 })); }}
                />
                <TabButton
                    label="Expired"
                    isActive={activeTab === 'expired'}
                    variant="outline"
                    onClick={() => { setActiveTab('expired'); setPagination(p => ({ ...p, page: 1 })); }}
                />
            </div>

            <div className="mb-6">
                <div className="bg-[#f9fafb] rounded-lg px-4 py-3 flex items-center border border-gray-100 max-w-md">
                    <Search className="text-gray-400 mr-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search by email username"
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                        className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
                    />
                </div>
            </div>

            <div className="bg-white">
                <CustomTable
                    columns={columns}
                    dataSource={subscriptions}
                    loading={loading}
                    rowKey="subscriptionId"
                    pagination={false}
                />
                {pagination.total > 0 && (
                    <CustomPagination
                        current={pagination.page}
                        pageSize={pagination.perPage}
                        total={pagination.total}
                        onChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, iconBg }) {
    return (
        <div className="border border-gray-100 rounded-xl p-6 flex justify-between items-center bg-white shadow-sm">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-[#1e1e2d]">{value}</h3>
            </div>
            <div className={`${iconBg} p-3 rounded-xl shadow-md`}>
                {icon}
            </div>
        </div>
    );
}

function TabButton({ label, isActive, onClick, variant = 'solid' }) {
    if (isActive) {
        return (
            <button
                onClick={onClick}
                className="bg-[#ff4081] text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-md transition-colors"
            >
                {label}
            </button>
        );
    }
    return (
        <button
            onClick={onClick}
            className="px-6 py-2.5 rounded-lg font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
            {label}
        </button>
    );
}

function TierBadge({ tier }) {
    let styles = "bg-gray-100 text-gray-600";
    if (tier === 'Platinum') styles = "bg-[#a855f7] text-white border border-[#9333ea]";
    if (tier === 'Gold') styles = "bg-[#fbbf24] text-white border border-[#f59e0b]";
    if (tier === 'Silver') styles = "bg-[#9ca3af] text-white border border-[#6b7280]";

    return (
        <span className={`${styles} px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[70px] text-center`}>
            {tier}
        </span>
    );
}

function StatusBadge({ status }) {
    let styles = "bg-gray-100 text-gray-600";
    const upperStatus = status?.toUpperCase();
    if (upperStatus === 'ACTIVE') styles = "bg-green-100 text-green-600 border border-green-600";
    if (upperStatus === 'CANCELLED') styles = "bg-red-100 text-red-500 border border-red-500";
    if (upperStatus === 'EXPIRED') styles = "bg-gray-100 text-gray-500 border border-gray-500";

    return (
        <span className={`${styles} px-3 py-1 rounded-md text-xs font-medium inline-block min-w-[70px] text-center uppercase`}>
            {status}
        </span>
    );
}

