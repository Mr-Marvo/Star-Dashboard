'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalStoragedata } from '@/app/helpers/storageHelper';
import {
    Users,
    Folder,
    Play,
    CheckSquare,
    Video,
    Heart,
    Calendar,
    ChevronDown
} from 'lucide-react';
import { Skeleton, DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { getDashboardAnalyticsCounts, getSubscriptionGrowths } from '@/app/services/dashboardService';
import CustomTable from '@/components/CustomTable';





export default function DashboardOverview() {
    const router = useRouter();
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalParticipants: 0,
        totalVideosSubmitted: 0,
        totalVotesReceived: 0,
        latestCampaigns: []
    });

    const [chartLoading, setChartLoading] = useState(false);
    const [chartData, setChartData] = useState([]);

    // Default date range: Last 12 months
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(1, 'year').startOf('day'),
        dayjs().endOf('day')
    ]);



    useEffect(() => {
        const userData = getLocalStoragedata("userData");
        if (!userData || !userData.isActive) {
            router.push('/login');
        } else if (!isChecked) {
            setIsChecked(true);
        }
    }, [router, isChecked]);

    useEffect(() => {
        if (isChecked) {
            fetchDashboardData();
            fetchChartData();
        }
    }, [isChecked, dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await getDashboardAnalyticsCounts();
            if (response.data?.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard counts:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        if (!dateRange || dateRange.length !== 2) return;

        try {
            setChartLoading(true);
            const response = await getSubscriptionGrowths({
                from: dateRange[0].toISOString(),
                to: dateRange[1].toISOString()
            });
            if (response.data?.success) {
                setChartData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
        } finally {
            setChartLoading(false);
        }
    };

    const formatDateRange = (duration) => {
        if (!duration?.from || !duration?.to) return 'N/A';
        const from = new Date(duration.from);
        const to = new Date(duration.to);
        const options = { month: 'short', day: '2-digit' };
        return `${from.toLocaleDateString('en-US', options)} - ${to.toLocaleDateString('en-US', options)}`;
    };

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-medium text-gray-700">{text}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Active' || status === 'Live' ? 'bg-green-100 text-green-600' :
                    status === 'Draft' || status === 'Pending' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                    {status}
                </span>
            )
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (duration) => <span className="text-gray-500">{formatDateRange(duration)}</span>
        },
        {
            title: 'Entries',
            dataIndex: 'entriesUserCount',
            key: 'entries',
            render: (count) => (
                <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">{count || 0} Entries</span>
                            <span className="text-xs font-medium text-gray-600">
                                {count > 0 ? '100%' : '0%'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${count > 0 ? 'bg-green-500 w-full' : 'bg-gray-300 w-0'
                                    }`}
                            ></div>
                        </div>
                    </div>
                </div>
            )
        }
    ];



    if (!isChecked) return null;

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-gray-800 pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1e1e2d] mb-1">Super Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Welcome back! Here&apos;s what&apos;s happening with Voice Star today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Campaigns"
                    value={loading ? <Skeleton.Button active size="small" /> : data.totalCampaigns.toLocaleString()}
                    icon={<Folder size={20} className="text-[#3b82f6]" />}
                    iconBg="bg-[#eff6ff]"
                />
                <StatCard
                    title="Active Campaigns"
                    value={loading ? <Skeleton.Button active size="small" /> : data.activeCampaigns.toLocaleString()}
                    icon={<Play size={20} className="text-[#22c55e]" />}
                    iconBg="bg-[#f0fdf4]"
                />
                <StatCard
                    title="Completed Campaigns"
                    value={loading ? <Skeleton.Button active size="small" /> : data.completedCampaigns.toLocaleString()}
                    icon={<CheckSquare size={20} className="text-[#a855f7]" />}
                    iconBg="bg-[#f5f3ff]"
                />
                <StatCard
                    title="Total Participants"
                    value={loading ? <Skeleton.Button active size="small" /> : data.totalParticipants.toLocaleString()}
                    icon={<Users size={20} className="text-[#3b82f6]" />}
                    iconBg="bg-[#eff6ff]"
                />
                <StatCard
                    title="Total Videos Submitted"
                    value={loading ? <Skeleton.Button active size="small" /> : data.totalVideosSubmitted.toLocaleString()}
                    icon={<Video size={20} className="text-[#ec4899]" />}
                    iconBg="bg-[#fdf2f8]"
                />
                <StatCard
                    title="Total Votes Received"
                    value={loading ? <Skeleton.Button active size="small" /> : data.totalVotesReceived.toLocaleString()}
                    icon={<Heart size={20} className="text-[#f97316]" />}
                    iconBg="bg-[#fff7ed]"
                />
            </div>

            {/* Subscription Growth Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-[#1e1e2d]">Subscription Growth</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Date Range:</span>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            className="bg-[#f9fafb] border-gray-100 rounded-lg text-xs"
                            variant="borderless"
                        />
                    </div>
                </div>
                <div className="h-[350px] w-full relative">
                    {chartLoading && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <Skeleton active paragraph={{ rows: 8 }} />
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Campaigns Table Section */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#1e1e2d]">Recent Campaigns</h3>
                </div>
                <div className="p-2">
                    <CustomTable
                        columns={columns}
                        dataSource={data.latestCampaigns}
                        loading={loading}
                        rowKey="id"
                    />


                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, growth, icon, iconBg }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`${iconBg} p-2.5 rounded-xl`}>
                    {icon}
                </div>
                {growth && (
                    <div className="flex items-center gap-1 text-[#22c55e] bg-[#f0fdf4] px-2 py-0.5 rounded text-[11px] font-bold">
                        <span>↑</span>
                        <span>{growth}% from last month</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-[#1e1e2d]">{value}</h3>
            </div>
        </div>
    );
}
