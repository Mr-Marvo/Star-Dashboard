"use client";
import React, { useState, useEffect } from "react";
import { Select, ConfigProvider, message } from "antd";
import {
    Users,
    UserCheck,
    Video,
    DollarSign,
    Calendar,
    ChevronDown,
} from "lucide-react";
import CustomTable from "@/components/CustomTable";
import CustomPagination from "@/components/CustomPagination";
import { getAnalytics } from "@/app/services/analyticsService";

const AnalyticsPage = () => {
    const [dateRange, setDateRange] = useState("30");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        fetchAnalytics(dateRange);
    }, [dateRange]);

    const fetchAnalytics = async (days) => {
        setLoading(true);
        try {
            const response = await getAnalytics(days);
            if (response.data.success) {
                setAnalyticsData(response.data.data);
            } else {
                message.error(response.data.message || "Failed to fetch analytics");
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            message.error("An error occurred while fetching analytics");
        } finally {
            setLoading(false);
        }
    };

    const totals = analyticsData?.totals || {};
    const daily = analyticsData?.daily || {};

    const stats = [
        {
            title: "Total Signups",
            value: totals.totalSignups || 0,
            icon: <Users className="w-6 h-6 text-white" />,
            bgColor: "bg-blue-600",
        },
        {
            title: "Active Users",
            value: totals.activeUsers || 0,
            icon: <UserCheck className="w-6 h-6 text-white" />,
            bgColor: "bg-green-600",
        },
        {
            title: "Videos Uploaded",
            value: totals.totalVideos || 0,
            icon: <Video className="w-6 h-6 text-white" />,
            bgColor: "bg-purple-600",
        },
        {
            title: "Total Revenue",
            value: `LKR ${(totals.totalRevenue || 0).toLocaleString()}`,
            icon: <DollarSign className="w-6 h-6 text-white" />,
            bgColor: "bg-orange-500",
        },
    ];

    // Helper to calculate percentage for trend bars
    const calculatePercent = (value, array) => {
        if (!array || array.length === 0) return 0;
        const maxValue = Math.max(...array.map(item => item.value), 0);
        return maxValue > 0 ? (value / maxValue) * 100 : 0;
    };

    const signupTrends = (daily.signups || []).slice(-10).reverse().map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: item.value,
        percent: calculatePercent(item.value, daily.signups)
    }));

    const revenueTrends = (daily.revenue || []).slice(-10).reverse().map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: `LKR ${item.value}`,
        numericValue: item.value,
        percent: calculatePercent(item.value, daily.revenue)
    }));

    // Merge daily data for the table
    const tableData = (daily.signups || []).map((item, index) => {
        const date = item.date;
        const signups = item.value;
        const revenue = daily.revenue?.[index]?.value || 0;
        const activeUsers = daily.activeUsers?.[index]?.value || 0;
        const videos = daily.videos?.[index]?.value || 0;
        const votes = daily.votes?.[index]?.value || 0;

        return {
            id: index,
            date: new Date(date).toLocaleDateString('en-US'),
            signups,
            activeUsers,
            videos,
            votes,
            revenue: `LKR ${revenue.toLocaleString()}`,
        };
    }).reverse();

    const tableColumns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: "SignUps",
            dataIndex: "signups",
            key: "signups",
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: "Active Users",
            dataIndex: "activeUsers",
            key: "activeUsers",
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: "Videos",
            dataIndex: "videos",
            key: "videos",
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: "Votes",
            dataIndex: "votes",
            key: "votes",
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: "Revenue",
            dataIndex: "revenue",
            key: "revenue",
            render: (text) => <span className="text-green-500 font-medium">{text}</span>,
        },
    ];

    // Pagination logic
    const pageSize = 10;
    const paginatedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#EC4899",
                    borderRadius: 8,
                },
            }}
        >
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Reports & Analytics
                        </h1>
                        <p className="text-gray-500">Platform performance insights</p>
                    </div>
                    <Select
                        defaultValue="30"
                        className="w-40"
                        loading={loading}
                        onChange={(val) => {
                            setDateRange(val);
                            setCurrentPage(1);
                        }}
                        suffixIcon={<ChevronDown className="w-4 h-4 text-gray-400" />}
                        options={[
                            { value: "7", label: "Last 7 Days" },
                            { value: "30", label: "Last 30 Days" },
                            { value: "90", label: "Last 3 Months" },
                        ]}
                    />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
                        >
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">{stat.title}</span>
                                <span className="text-2xl font-bold mt-1 text-gray-900">
                                    {loading ? "..." : stat.value}
                                </span>
                            </div>
                            <div
                                className={`${stat.bgColor} p-3 rounded-lg shadow-sm flex items-center justify-center`}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trends Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Signup Trends */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 text-gray-900">
                            Daily Signup Trends
                        </h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">Loading trends...</div>
                            ) : signupTrends.length > 0 ? (
                                signupTrends.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 w-24 min-w-[6rem] text-gray-500 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{item.date}</span>
                                        </div>
                                        <div className="flex-1 w-full relative h-8 bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full flex items-center justify-end px-3 text-xs font-medium relative z-10 transition-all duration-500 ${item.value > 0 ? "bg-blue-600 text-white" : "text-gray-400"
                                                    }`}
                                                style={{ width: item.value > 0 ? `${item.percent}%` : "100%" }}
                                            >
                                                {item.value}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 text-gray-900">
                            Daily Revenue Trend
                        </h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">Loading trends...</div>
                            ) : revenueTrends.length > 0 ? (
                                revenueTrends.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 w-24 min-w-[6rem] text-gray-500 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{item.date}</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${item.numericValue > 0 ? "bg-green-500" : "bg-transparent"}`}
                                                    style={{ width: `${item.percent}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 min-w-[6rem] text-right">
                                                {item.value}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-900 px-1">
                        Detailed Analytics Table
                    </h3>
                    <CustomTable
                        columns={tableColumns}
                        dataSource={paginatedData}
                        loading={loading}
                        rowKey="id"
                    />
                    <CustomPagination
                        current={currentPage}
                        total={tableData.length}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>
        </ConfigProvider>
    );
};

export default AnalyticsPage;

