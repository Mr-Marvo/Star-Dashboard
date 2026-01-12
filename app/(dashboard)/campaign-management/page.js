'use client';

import React, { useEffect, useState } from 'react';
import { Input, Button, Tabs, ConfigProvider, Empty, Spin } from 'antd';
import { Search, Trophy, Calendar, Users, Video, Award, Eye, Plus } from 'lucide-react';
import { getAllCampaigns } from '@/app/services/campaignService';
import CustomPagination from "@/components/CustomPagination";
import useLazyFetch from '@/app/hooks/useLazyFetch';
import useDebounce from '@/app/hooks/useDebounce';
import dayjs from 'dayjs';
import CreateCampaign from '@/components/campaign/CreateCampaign';
import EditCampaign from '@/components/campaign/EditCampaign';
import ViewCampaign from '@/components/campaign/ViewCampaign';

export default function CampaignManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const { trigger: triggerFetch, loading } = useLazyFetch(getAllCampaigns);

    const [fetchedCampaigns, setFetchedCampaigns] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [activeTab, setActiveTab] = useState('1');

    const fetchCampaigns = React.useCallback(async () => {
        let status = '';
        switch (activeTab) {
            case '2': status = 'active'; break;
            case '3': status = 'upcoming'; break;
            case '4': status = 'completed'; break;
            default: status = ''; break;
        }

        const params = {
            page: pagination.current,
            perPage: pagination.pageSize,
            search: debouncedSearchQuery,
            campaignStatus: status
        };

        const res = await triggerFetch(params);
        if (res?.data?.success) {
            const { data, total, page, perPage } = res.data.data;

            setFetchedCampaigns(data);
            setPagination(prev => ({ ...prev, current: page, total: total || 0, pageSize: perPage || 10 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pagination.current, pagination.pageSize, debouncedSearchQuery]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);

    const handleEdit = (campaign) => {
        setSelectedCampaign(campaign);
        setIsEditModalOpen(true);
    };

    const handleLeaderboard = (campaign) => {
        setSelectedCampaign(campaign);
        setIsLeaderboardOpen(true);
    };

    const deriveCampaignStatus = (campaign) => {
        const now = dayjs();
        const complete = dayjs(campaign.completeTime);
        const enrollStart = dayjs(campaign.enrollStartTime);
        if (now.isBefore(enrollStart)) return 'Upcoming';
        if (now.isAfter(complete)) return 'Completed';
        return 'Active';
    };

    const getStatusBadge = (status) => {
        let styles = "";
        const formattedStatus = status;

        switch (formattedStatus) {
            case "In Review":
                styles = "bg-green-100 text-green-600 border-green-600";
                break;
            case "Voting Started":
                styles = "bg-orange-100 text-orange-600 border-orange-600";
                break;
            case "Completed":
                styles = "bg-purple-100 text-purple-600 border-purple-600";
                break;
            case "Upcoming":
                styles = "bg-blue-100 text-blue-600 border-blue-600";
                break;
            case "Active":
                styles = "bg-green-100 text-green-600 border-green-600";
                break;
            default:
                styles = "bg-gray-100 text-gray-600 border-gray-600";
        }
        return (
            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles}`}>
                {formattedStatus}
            </span>
        );
    };

    const CampaignCard = ({ data }) => {
        const status = deriveCampaignStatus(data);

        return (
            <div className="bg-[#f2f2f2] p-6 rounded-xl flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            {data.campaignImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={data.campaignImageUrl} alt={data.title} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.iconColor}`}>
                                    <Trophy size={20} />
                                </div>
                            )}
                            <h3 className="font-semibold text-lg line-clamp-1" title={data.title}>
                                {data.title?.length > 10 ? `${data.title.slice(0, 10)}...` : data.title}
                            </h3>
                        </div>
                        {getStatusBadge(status)}
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-400 text-xs mb-1">Duration</p>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar size={16} />
                            <span>{data.enrollStartTime ? dayjs(data.enrollStartTime).format('YYYY-MM-DD') : 'N/A'} - {data.completeTime ? dayjs(data.completeTime).format('YYYY-MM-DD') : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 flex justify-between items-center mb-6">
                        <div className="text-center">
                            <div className="text-pink-500 flex justify-center mb-1"><Users size={18} /></div>
                            <div className="font-bold text-lg">{data.enrolledCount || 0}</div>
                            <div className="text-xs text-gray-400">Participants</div>
                        </div>
                        <div className="text-center">
                            <div className="text-purple-500 flex justify-center mb-1"><Video size={18} /></div>
                            <div className="font-bold text-lg">{data.videoCount || 0}</div>
                            <div className="text-xs text-gray-400">Videos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-orange-500 flex justify-center mb-1"><Award size={18} /></div>
                            <div className="font-bold text-lg">{data.votesCount || 0}</div>
                            <div className="text-xs text-gray-400">Votes</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-auto">
                    <Button
                        onClick={() => handleLeaderboard(data)}
                        className="flex-1 !bg-[#333] !text-white hover:!bg-[#444] !border-none h-10 flex items-center justify-center gap-2"
                    >
                        <Eye size={16} /> LeaderBoard
                    </Button>
                    {status !== 'Completed' && (
                        <Button
                            onClick={() => handleEdit(data)}
                            className="!bg-[#b30000] !text-white hover:!bg-[#cc0000] !border-none h-10 px-6 font-medium"
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Campaign Management</h1>
                    <p className="text-slate-500">Create and manage campaigns</p>
                </div>
                <Button type="primary" icon={<Plus size={18} />} onClick={showModal} className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !border-none !h-10 !px-6 !font-medium">
                    Create Campaigns
                </Button>
            </div>

            <div className="flex flex-col gap-2 mb-6">
                <Tabs
                    defaultActiveKey="1"
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="custom-tabs gap-1"
                    items={[
                        { key: '1', label: 'All Campaigns' },
                        { key: '2', label: 'Active' },
                        { key: '3', label: 'Upcoming' },
                        { key: '4', label: 'Past' },
                    ]}
                />
                <Input
                    prefix={<Search className="text-gray-400" size={18} />}
                    placeholder="Search by Campaign"
                    className="!bg-[#f5f5f5] !border-none !h-12 !text-base !rounded-lg"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spin size="large" />
                </div>
            ) : fetchedCampaigns.length === 0 ? (
                <div className="py-20">
                    <Empty description="No campaigns found" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {fetchedCampaigns.map(campaign => (
                        <CampaignCard
                            key={campaign.id}
                            data={{
                                ...campaign,
                                iconColor: 'bg-purple-100 text-purple-500'
                            }}
                        />
                    ))}
                </div>
            )}

            {pagination.total > pagination.pageSize && (
                <CustomPagination
                    current={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                />
            )}

            <ConfigProvider
                theme={{
                    token: {
                        colorBgElevated: '#151529',
                        colorText: 'white',
                        colorIcon: 'white',
                        colorIconHover: '#ccc',
                        colorTextHeading: 'white',
                    },
                    components: {
                        Modal: {
                            headerBg: '#151529',
                            contentBg: '#151529',
                            titleColor: 'white',
                        },
                        Select: {
                            selectorBg: '#2e2e48',
                            optionSelectedBg: '#3b3b58',
                            colorBorder: '#444',
                            colorTextPlaceholder: '#888',
                        },
                        Input: {
                            colorBgContainer: '#2e2e48',
                            colorBorder: '#444',
                            colorTextPlaceholder: '#888',
                        },
                        DatePicker: {
                            colorBgContainer: '#2e2e48',
                            colorBorder: '#444',
                            colorTextPlaceholder: '#888',
                            colorTextDisabled: '#666',
                        },
                        InputNumber: {
                            colorBgContainer: '#2e2e48',
                            colorBorder: '#444',
                            colorTextPlaceholder: '#888',
                        }
                    }
                }}
            >
                <CreateCampaign
                    open={isModalOpen}
                    onCancel={handleCancel}
                    onSuccess={fetchCampaigns}
                />

                <EditCampaign
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    onSuccess={fetchCampaigns}
                    campaign={selectedCampaign}
                />

                <ViewCampaign
                    open={isLeaderboardOpen}
                    onCancel={() => setIsLeaderboardOpen(false)}
                    campaign={selectedCampaign}
                />
            </ConfigProvider>
        </div>
    );
}
