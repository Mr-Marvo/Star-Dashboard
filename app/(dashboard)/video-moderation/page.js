"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Input, Button, Modal, Tooltip } from "antd";
import { Search, Flag, Check, X, Play, Eye, TrendingUp, Calendar, Award, XCircle, Trash2, Ban, CheckCircle } from "lucide-react";
import CustomTable from "@/components/CustomTable";
import CustomPagination from "@/components/CustomPagination";
import { getAllVideos, approveVideo, rejectVideo, deactivateVideo, activateVideo, deleteVideo } from "@/app/services/videoService";
import useLazyFetch from "@/app/hooks/useLazyFetch";
import useDebounce from "@/app/hooks/useDebounce";
import dayjs from "dayjs";
import VideoIcon from "@/public/svg/VideoIcon";
import { getAllCampaignsDropdown } from "@/app/services/campaignService";
import { Select } from "antd";

export default function VideoModerationPage() {
    const [activeTab, setActiveTab] = useState("1");
    const [searchText, setSearchText] = useState("");
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const [rejectReason, setRejectReason] = useState("");
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaignOptions, setCampaignOptions] = useState([]);

    const { trigger: fetchCampaigns } = useLazyFetch(getAllCampaignsDropdown);

    useEffect(() => {
        if (selectedVideo) setIsPlaying(false);
    }, [selectedVideo]);

    useEffect(() => {
        const loadCampaigns = async () => {
            const res = await fetchCampaigns();
            if (res?.data?.success) {
                const options = res.data.data.map(c => ({
                    label: c.title,
                    value: String(c.id || c.campaignId || c._id)
                }));
                setCampaignOptions(options);
            }
        };
        loadCampaigns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const [fetchedVideos, setFetchedVideos] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [modal, contextHolder] = Modal.useModal();
    const debouncedSearch = useDebounce(searchText, 500);
    const { trigger: triggerFetch, loading: isLoading } = useLazyFetch(getAllVideos);
    const { trigger: triggerApprove } = useLazyFetch(approveVideo);
    const { trigger: triggerReject } = useLazyFetch(rejectVideo);
    const { trigger: triggerDeactivate } = useLazyFetch(deactivateVideo);
    const { trigger: triggerActivate } = useLazyFetch(activateVideo);
    const { trigger: triggerDelete } = useLazyFetch(deleteVideo);

    const fetchVideos = useCallback(async () => {
        let status = '';
        switch (activeTab) {
            case '2': status = 'PENDING'; break;
            case '3': status = 'PUBLISHED'; break;
            case '4': status = 'REJECTED'; break;
            case '5': status = 'DEACTIVATED'; break;
            default: status = ''; break;
        }

        const params = {
            page: pagination.current,
            limit: pagination.pageSize,
            search: debouncedSearch,
            status: status,
            campaign: selectedCampaign
        };

        const res = await triggerFetch(params);


        if (res?.data?.success) {
            const { videos, total, page, limit } = res.data.data;
            setFetchedVideos(videos || []);
            setPagination(prev => ({
                ...prev,
                total: total || 0,
                current: page || 1,
                pageSize: limit || 10
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pagination.current, pagination.pageSize, debouncedSearch, selectedCampaign]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleRowClick = (record) => {
        setSelectedVideo(record);
        setIsModalOpen(true);
    };

    const handleApprove = (record) => {
        modal.confirm({
            title: 'Approve Video',
            content: 'Are you sure you want to approve this video?',
            okText: 'Approve',
            cancelText: 'Cancel',
            onOk: async () => {
                const res = await triggerApprove({ id: record.id }, { successMsg: "Video approved successfully!", errorMsg: "Failed to approve video." });
                if (res?.data?.success) {
                    setIsModalOpen(false);
                    fetchVideos();
                }
            }
        });
    };

    const handleReject = (record) => {
        setSelectedVideo(record);
        setRejectReason("");
        setIsRejectModalOpen(true);
    };

    const submitReject = async () => {
        const res = await triggerReject({
            id: selectedVideo.id,
            rejectReason: rejectReason
        }, {
            successMsg: "Video rejected successfully!",
            errorMsg: "Failed to reject video."
        });

        if (res?.data?.success) {
            setIsRejectModalOpen(false);
            if (isModalOpen) setIsModalOpen(false);
            fetchVideos();
        }
    };

    const handleDeactivate = (record) => {
        modal.confirm({
            title: 'Deactivate Video',
            content: 'Are you sure you want to deactivate this video?',
            okText: 'Deactivate',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                const res = await triggerDeactivate({ id: record.id }, { successMsg: "Video deactivated successfully!", errorMsg: "Failed to deactivate video." });
                if (res?.data?.success) {
                    setIsModalOpen(false);
                    fetchVideos();
                }
            }
        });
    };

    const handleActivate = (record) => {
        modal.confirm({
            title: 'Activate Video',
            content: 'Are you sure you want to activate this video?',
            okText: 'Activate',
            cancelText: 'Cancel',
            onOk: async () => {
                const res = await triggerActivate({ id: record.id }, { successMsg: "Video activated successfully!", errorMsg: "Failed to activate video." });
                if (res?.data?.success) {
                    setIsModalOpen(false);
                    fetchVideos();
                }
            }
        });
    };

    const handleDelete = (record) => {
        modal.confirm({
            title: 'Delete Video',
            content: 'Are you sure you want to delete this video permanently?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                const res = await triggerDelete({ id: record.id }, { successMsg: "Video deleted successfully!", errorMsg: "Failed to delete video." });
                if (res?.data?.success) {
                    setIsModalOpen(false);
                    fetchVideos();
                }
            }
        });
    };

    const handleAction = (e, action, record) => {
        e.stopPropagation();
        if (action === 'approve') handleApprove(record);
        if (action === 'reject') handleReject(record);
        if (action === 'delete') handleDeactivate(record);
        if (action === 'permanent_delete') handleDelete(record);
        if (action === 'activate') handleActivate(record);
        if (action === 'view') handleRowClick(record);
        // if (action === 'flag') ... 
    };

    const getStatusBadge = (status) => {
        let styles = "";
        const formattedStatus = String(status || "").charAt(0).toUpperCase() + String(status || "").slice(1).toLowerCase();

        switch (formattedStatus) {
            case "Approved":
            case "Published":
                styles = "bg-green-50 text-green-500 border-green-500";
                break;
            case "Pending":
                styles = "bg-orange-50 text-orange-400 border-orange-400";
                break;
            case "Flagged":
                styles = "bg-pink-50 text-pink-500 border-pink-500";
                break;
            case "Rejected":
                styles = "bg-red-50 text-red-500 border-red-500";
                break;
            case "Deactivated":
                styles = "bg-slate-100 text-slate-500 border-slate-500";
                break;
            default:
                styles = "bg-indigo-50 text-indigo-500 border-indigo-500";
        }
        return (
            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${styles}`}>
                {formattedStatus}
            </span>
        );
    };

    const isActionable = (record) => {
        if (!record?.campaign?.votingStartTime) return true;
        return dayjs(record.campaign.votingStartTime).isAfter(dayjs());
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (title, record) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(record);
                        }}
                    >
                        <VideoIcon />
                    </div>
                    <div>
                        <div className="font-medium text-gray-700">
                            {(record.title || "Untitled Video").length > 15
                                ? `${(record.title || "Untitled Video").slice(0, 15)}...`
                                : (record.title || "Untitled Video")}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Competitor",
            dataIndex: "user",
            key: "competitor",
            render: (user) => (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="text-gray-500">
                        {(user?.name || user?.userName || "Unknown").length > 20
                            ? `${(user?.name || user?.userName || "Unknown").slice(0, 20)}...`
                            : (user?.name || user?.userName || "Unknown")}
                    </span>
                </div>
            ),
        },
        {
            title: "Campaign",
            dataIndex: "campaign",
            key: "campaign",
            render: (campaign) => (
                <span className="text-gray-500">
                    {(campaign?.title || "-").length > 15
                        ? `${(campaign?.title || "-").slice(0, 15)}...`
                        : (campaign?.title || "-")}
                </span>
            ),
        },
        {
            title: "Views",
            dataIndex: "viewsCount",
            key: "viewsCount",
            render: (text) => <span className="text-gray-500">{text || 0}</span>,
        },
        {
            title: "Votes",
            dataIndex: "votesCount",
            key: "votesCount",
            render: (text) => <span className="text-gray-500">{text || 0}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => getStatusBadge(status),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => {
                const isPending = record.status === 'PENDING';
                const actionable = isActionable(record);

                return (
                    <div className="flex items-center justify-end gap-2">
                        <Tooltip title="View Details">
                            <button
                                onClick={(e) => handleAction(e, "view", record)}
                                className="p-1 rounded transition-colors text-gray-500 hover:bg-gray-50"
                            >
                                <Eye size={18} />
                            </button>
                        </Tooltip>

                        {isPending ? (
                            <>
                                <Tooltip title={actionable ? "Approve" : "Voting Started"}>
                                    <button
                                        onClick={(e) => actionable && handleAction(e, "approve", record)}
                                        className={`p-1 rounded transition-colors ${actionable ? "text-green-500 hover:bg-green-50" : "text-gray-300 cursor-not-allowed"}`}
                                        disabled={!actionable}
                                    >
                                        <Check size={18} />
                                    </button>
                                </Tooltip>
                                <Tooltip title={actionable ? "Reject" : "Voting Started"}>
                                    <button
                                        onClick={(e) => actionable && handleAction(e, "reject", record)}
                                        className={`p-1 rounded transition-colors ${actionable ? "text-red-500 hover:bg-red-50" : "text-gray-300 cursor-not-allowed"}`}
                                        disabled={!actionable}
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </Tooltip>
                            </>
                        ) : record.status === 'DEACTIVATED' ? (
                            <Tooltip title={actionable ? "Activate" : "Voting Started"}>
                                <button
                                    onClick={(e) => actionable && handleAction(e, "activate", record)}
                                    className={`p-1 rounded transition-colors ${actionable ? "text-green-500 hover:bg-green-50" : "text-gray-300 cursor-not-allowed"}`}
                                    disabled={!actionable}
                                >
                                    <CheckCircle size={18} />
                                </button>
                            </Tooltip>
                        ) : record.status !== 'REJECTED' ? (
                            <Tooltip title={actionable ? "Deactivate" : "Voting Started"}>
                                <button
                                    onClick={(e) => actionable && handleAction(e, "delete", record)}
                                    className={`p-1 rounded transition-colors ${actionable ? "text-red-500 hover:bg-red-50" : "text-gray-300 cursor-not-allowed"}`}
                                    disabled={!actionable}
                                >
                                    <Ban size={18} />
                                </button>
                            </Tooltip>
                        ) : null}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {contextHolder}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Video Moderation</h1>
                <p className="text-slate-500">Review and moderate video submissions</p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <Tabs
                    defaultActiveKey="1"
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="custom-tabs gap-1"
                    items={[
                        { key: '1', label: 'All' },
                        { key: '2', label: 'Pending' },
                        { key: '3', label: 'Approved' },
                        { key: '4', label: 'Rejected' },
                        { key: '5', label: 'Deactivated' },
                    ]}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                        prefix={<Search className="text-gray-400" size={18} />}
                        placeholder="Search by video title or user"
                        className="!bg-[#f9fafb] !border-none !h-12 !text-base !rounded-lg"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPagination(prev => ({ ...prev, current: 1 }));
                        }}
                    />

                    <Select
                        showSearch
                        placeholder="Select Campaign"
                        optionFilterProp="label"
                        className="w-full h-12 custom-select-campaign"
                        options={campaignOptions}
                        value={selectedCampaign}
                        onChange={(value) => {
                            setSelectedCampaign(value);
                            setPagination(prev => ({ ...prev, current: 1 }));
                        }}
                        allowClear
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </div>
            </div>

            <CustomTable
                columns={columns}
                dataSource={fetchedVideos}
                loading={isLoading}
                rowKey="id"
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    className: "cursor-pointer hover:bg-gray-50",
                })}
            />

            {pagination.total > pagination.pageSize && (
                <CustomPagination
                    current={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
                />
            )}

            <Modal
                title={null}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
                destroyOnHidden
                centered
                closeIcon={null}
                className="custom-modal"
                styles={{
                    content: { padding: 0, borderRadius: '16px', overflow: 'hidden' }
                }}
            >
                {selectedVideo && (
                    <div className="p-0">
                        <div className={`relative p-6 bg-[#ECFDF5] border-b border-gray-100`}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-200/50 transition-colors z-10"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                                    {selectedVideo.user?.profilePicture ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={selectedVideo.user.profilePicture} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <VideoIcon />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 m-0">{selectedVideo.title}</h2>
                            </div>

                            <div className="flex items-center gap-4">
                                {getStatusBadge(selectedVideo.status)}
                                <div className="flex items-center gap-2 text-gray-600">
                                    {/* User Icon/Avatar */}
                                    <span className="text-sm font-medium">{selectedVideo.user?.name || selectedVideo.user?.userName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm h-32">
                                    <Eye className="text-blue-400 mb-2" size={24} />
                                    <div className="text-gray-500 text-sm mb-1">Total Views</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedVideo.viewsCount || 0}</div>
                                </div>
                                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm h-32">
                                    <TrendingUp className="text-orange-400 mb-2" size={24} />
                                    <div className="text-gray-500 text-sm mb-1">Total Votes</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedVideo.votesCount || 0}</div>
                                </div>
                                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm h-32">
                                    <Calendar className="text-gray-400 mb-2" size={24} />
                                    <div className="text-gray-500 text-sm mb-1">Submitted</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedVideo.createdAt ? dayjs(selectedVideo.createdAt).format('MMM DD') : '-'}</div>
                                </div>
                                <div className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm h-32">
                                    <Award className="text-purple-400 mb-2" size={24} />
                                    <div className="text-gray-500 text-sm mb-1">Campaign</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedVideo.campaign?.title || "Voice"}</div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Video Preview */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Video Preview</h3>
                                    {selectedVideo.videoUrl ? (
                                        <div
                                            className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[3/4] group cursor-pointer"
                                            onClick={() => setIsPlaying(true)}
                                        >
                                            {!isPlaying ? (
                                                <>
                                                    <video
                                                        src={selectedVideo.videoUrl}
                                                        className="w-full h-full object-cover opacity-60"
                                                    />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                                                        <Play size={48} fill="white" className="mb-2 drop-shadow-lg" />
                                                        <div className="font-bold text-lg drop-shadow-md">Video Preview</div>
                                                        <div className="text-sm opacity-90 drop-shadow-md">Click to play</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <video
                                                    key={selectedVideo.videoUrl}
                                                    controls
                                                    autoPlay
                                                    className="w-full h-full object-contain bg-black"
                                                >
                                                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="aspect-[3/4] bg-gray-700 rounded-xl flex flex-col items-center justify-center text-white">
                                            <Play size={48} className="mb-2" />
                                            <span>No Video URL</span>
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <a href={selectedVideo.videoUrl || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 !text-green-500 hover:!text-green-600 !font-medium cursor-pointer">
                                            Open The Video in a new Tab <TrendingUp size={16} className="rotate-45" />
                                        </a>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="flex-1 flex flex-col justify-around gap-12">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Creator Information</h3>
                                        <div className="flex flex-row justify-around text-left gap-3">
                                            <div>
                                                <div className="text-4xl font-bold text-gray-900">{selectedVideo.user?.videoCount || 0}</div>
                                                <div className="text-gray-500 text-sm">Total Videos</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-bold text-gray-900">{selectedVideo.user?.receivedViewsCount || 0}</div>
                                                <div className="text-gray-500 text-sm">Total Views</div>
                                            </div>
                                            <div>
                                                <div className="text-4xl font-bold text-gray-900">{selectedVideo.user?.receivedVoteCount || 0}</div>
                                                <div className="text-gray-500 text-sm">Total Votes</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Moderation Actions</h3>
                                        <div className="flex flex-col gap-3">
                                            {selectedVideo.status === 'PUBLISHED' && (
                                                <Button
                                                    danger
                                                    size="large"
                                                    onClick={() => handleDeactivate(selectedVideo)}
                                                    className="w-full flex items-center justify-center gap-2 !bg-[#C5C5C5] !text-gray-600 hover:!bg-gray-200 !border-none !h-12 !text-base rounded-lg font-medium"
                                                >
                                                    Deactivate
                                                </Button>
                                            )}

                                            {selectedVideo.status === 'DEACTIVATED' && (
                                                <Button
                                                    size="large"
                                                    onClick={() => handleActivate(selectedVideo)}
                                                    className="w-full flex items-center justify-center gap-2 !bg-[#00D222] !text-white hover:!bg-[#059669] !border-none !h-12 !text-base rounded-lg font-medium"
                                                >
                                                    <Check size={20} /> Active Now
                                                </Button>
                                            )}

                                            {selectedVideo.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        danger
                                                        size="large"
                                                        onClick={() => handleReject(selectedVideo)}
                                                        className="w-full flex items-center justify-center gap-2 !bg-[#C03539] !text-white hover:!bg-[#a02c30] !border-none !h-12 !text-base rounded-lg"
                                                        disabled={!isActionable(selectedVideo)}
                                                    >
                                                        <XCircle size={20} /> Reject Video
                                                    </Button>
                                                    <Button
                                                        size="large"
                                                        onClick={() => handleApprove(selectedVideo)}
                                                        className="w-full flex items-center justify-center gap-2 !bg-[#659E75] !text-white hover:!bg-[#558b65] !border-none !h-12 !text-base rounded-lg"
                                                        disabled={!isActionable(selectedVideo)}
                                                    >
                                                        <Check size={20} /> Approve Video
                                                    </Button>
                                                </>
                                            )}


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title="Reject Video"
                open={isRejectModalOpen}
                onCancel={() => setIsRejectModalOpen(false)}
                okText="Reject"
                okType="danger"
                onOk={submitReject}
                confirmLoading={isLoading}
                destroyOnHidden
            >
                <div className="flex flex-col gap-4">
                    <p className="text-gray-600">Please provide a reason for rejecting this video:</p>
                    <Input.TextArea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="!resize-none"
                    />
                </div>
            </Modal>
        </div>
    );
}
