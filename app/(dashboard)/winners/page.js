"use client";
import React, { useState } from 'react';
import { Input } from 'antd';
import { Search, Trophy } from 'lucide-react';
import WinnersModal from '@/components/winners/WinnersModal';
import CustomPagination from '@/components/CustomPagination';
import CMSVideoModal from '@/components/CMSVideoModal';


import { getLatestWinner, getAllCampaignWinners } from '@/app/services/winnerService';
import useLazyFetch from '@/app/hooks/useLazyFetch';
import useDebounce from '@/app/hooks/useDebounce';
import { Spin } from 'antd';
import dayjs from 'dayjs';

const COLORS = ["bg-[#ec4899]", "bg-[#3b82f6]", "bg-[#9333ea]", "bg-[#f97316]", "bg-[#10b981]"];

export default function WinnersPage() {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [latestWinner, setLatestWinner] = useState(null);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleVideoClick = (video, e) => {
        if (e) e.stopPropagation();
        if (video) {
            setSelectedVideo(video);
            setVideoModalOpen(true);
        }
    };

    // Campaign List State
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const debouncedSearch = useDebounce(search, 500);

    const { trigger: fetchLatestWinner, loading: isLatestWinnerLoading } = useLazyFetch(getLatestWinner);

    // Fetch Latest Winner
    React.useEffect(() => {
        const loadLatestWinner = async () => {
            const res = await fetchLatestWinner();
            if (res?.data?.success) {
                setLatestWinner(res.data.data);
            }
        };
        loadLatestWinner();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch All Campaign Winners
    React.useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const response = await getAllCampaignWinners(page, 10, debouncedSearch);
                if (response.data.success) {
                    setCampaigns(response.data.data.data);
                    setTotal(response.data.data.total);
                }
            } catch (error) {
                console.error("Failed to fetch campaigns", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [page, debouncedSearch]);

    const handleRowClick = (campaign) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div className="p-3 md:p-8 max-w-[1600px] mx-auto">
            <h1 className="text-[28px] font-bold mb-2 text-black">Winners</h1>
            <p className="text-gray-500 mb-8 text-base">Announce and celebrate the winning submissions.</p>

            <div className="bg-[#fff7ed] rounded-2xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between shadow-sm border border-[#ffedd5] gap-6">
                {isLatestWinnerLoading ? (
                    <div className="w-full h-24 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : latestWinner ? (
                    <>
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                            <div
                                className="w-20 h-20 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-lg shadow-orange-200/50 relative overflow-hidden shrink-0  hover:opacity-90 transition-opacity"
                            >
                                {latestWinner.firstWinnerVideo?.user?.profilePicture ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={latestWinner.firstWinnerVideo?.user?.profilePicture} alt="Winner" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600"></div>
                                        <Trophy size={40} strokeWidth={1.5} className="relative z-10" />
                                    </>
                                )}
                            </div>
                            <div className='text-center md:text-left'>
                                <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold text-black">Latest Winner</h2>
                                    <span className="bg-[#F06E2336] text-[#f97316] text-xs px-2.5 py-0.5 rounded-lg border border-[#fdba74] font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                        <Trophy size={11} fill="#f97316" /> Champion
                                    </span>
                                </div>
                                <p className="text-gray-700 font-bold text-lg" title={latestWinner.campaign?.title}>{latestWinner.campaign?.title?.length > 30 ? `${latestWinner.campaign.title.slice(0, 30)}...` : (latestWinner.campaign?.title || 'Unknown Campaign')}</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right w-full md:w-auto">
                            <p className="text-gray-500 text-sm mb-1 font-medium">Prize Amount</p>
                            <p className="text-xl font-extrabold text-gray-800">LKR {latestWinner.campaign?.pricePool ? `${latestWinner.campaign.pricePool.toLocaleString()}` : 'N/A'}</p>
                        </div>
                    </>
                ) : (
                    <div className="w-full text-center text-gray-400 py-4">No latest winner found</div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 h-full flex flex-col justify-between">
                    <p className="text-gray-500 text-sm mb-4 font-medium">Winner</p>
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#ec4899] flex items-center justify-center text-white font-bold text-sm md:text-lg overflow-hidden">

                            <span>{(() => {
                                const name = latestWinner?.firstWinnerVideo?.user?.name;
                                if (!name) return 'NA';
                                const parts = name.trim().split(' ').filter(Boolean);
                                if (parts.length === 1) {
                                    return parts[0].substring(0, 2).toUpperCase();
                                }
                                return (parts[0][0] + parts[1][0]).toUpperCase();
                            })()}</span>
                            {/* )} */}
                        </div>
                        <div>
                            <p className="font-bold text-black text-base">{latestWinner?.firstWinnerVideo?.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{latestWinner?.firstWinnerVideo?.user?.email || ''}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 h-full flex flex-col justify-between">
                    <p className="text-gray-500 text-sm mb-2 font-medium">Total Votes</p>
                    <p className="text-2xl font-bold text-black">{latestWinner?.firstWinnerVideo?.votesCount?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 h-full flex flex-col justify-between">
                    <p className="text-gray-500 text-sm mb-2 font-medium">Total Views</p>
                    <p className="text-2xl font-bold text-black">{latestWinner?.firstWinnerVideo?.viewsCount?.toLocaleString() || 0}</p>
                </div>

                <div
                    className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 h-full flex flex-col justify-between cursor-pointer hover:border-orange-200 transition-colors group"
                    onClick={(e) => handleVideoClick(latestWinner?.firstWinnerVideo, e)}
                >
                    <p className="text-gray-500 text-sm mb-2 font-medium flex items-center gap-2">
                        Winning Video <Search size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="font-bold text-black text-lg truncate group-hover:text-orange-500 transition-colors" title={latestWinner?.firstWinnerVideo?.title}>
                        {latestWinner?.firstWinnerVideo?.title || 'N/A'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 h-full flex flex-col justify-between">
                    <p className="text-gray-500 text-sm mb-2 font-medium">Participants</p>
                    <p className="text-2xl font-bold text-black">{latestWinner?.campaign?.enrolledCount || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 h-full flex flex-col justify-between">
                    <p className="text-gray-500 text-sm mb-2 font-medium">End Date</p>
                    <p className="font-bold text-black text-sm whitespace-nowrap">{latestWinner?.campaign?.completeTime ? dayjs(latestWinner.campaign.completeTime).format('YYYY-MM-DD') : 'N/A'}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 mb-10 flex flex-col gap-4">
                <div className="text-gray-500 text-sm font-medium">Final Selection List</div>
                <div className="w-full flex flex-col md:flex-row items-center justify-between px-2 md:px-6 bg-gray-50/50 rounded-xl py-4 gap-4 md:gap-0">
                    {latestWinner?.firstWinnerVideo?.user?.name && (
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-9 h-9 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold shadow-md shadow-orange-200 shrink-0">1</div>
                            <div>
                                <p className="font-bold text-base text-black">
                                    {latestWinner.firstWinnerVideo.user.name}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {latestWinner.firstWinnerVideo.votesCount ? latestWinner.firstWinnerVideo.votesCount.toLocaleString() : 0} votes
                                </p>
                            </div>
                        </div>
                    )}
                    {latestWinner?.secondWinnerVideo?.user?.name && (
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-9 h-9 rounded-full bg-[#64748b] text-white flex items-center justify-center font-bold shadow-md shadow-slate-200 shrink-0">2</div>
                            <div>
                                <p className="font-bold text-base text-black">
                                    {latestWinner.secondWinnerVideo.user.name}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {latestWinner.secondWinnerVideo.votesCount ? latestWinner.secondWinnerVideo.votesCount.toLocaleString() : 0} votes
                                </p>
                            </div>
                        </div>
                    )}
                    {latestWinner?.thirdWinnerVideo?.user?.name && (
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-9 h-9 rounded-full bg-[#ec4899] text-white flex items-center justify-center font-bold shadow-md shadow-pink-200 shrink-0">3</div>
                            <div>
                                <p className="font-bold text-base text-black">
                                    {latestWinner.thirdWinnerVideo.user.name}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {latestWinner.thirdWinnerVideo.votesCount ? latestWinner.thirdWinnerVideo.votesCount.toLocaleString() : 0} votes
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-black font-bold mb-5 text-lg">All Campaign winners</h3>
            <div className="bg-gray-100 p-2.5 rounded-xl mb-6 max-w-full">
                <Input
                    prefix={<Search className="text-gray-400 mr-2" size={20} />}
                    placeholder="Search by campaign title..."
                    className="!bg-transparent !border-none !shadow-none placeholder-gray-500 text-base py-1"
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="flex flex-col gap-4 pb-10">
                {loading ? (
                    <div className="text-center py-10">
                        <Spin size="large" />
                    </div>
                ) : campaigns.length > 0 ? (
                    <>
                        {campaigns.map((campaign, index) => (
                            <div
                                key={campaign.campaignId}
                                onClick={() => handleRowClick(campaign)}
                                className="bg-white p-2 md:p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group duration-300 gap-4"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                                    <div className={`w-12 h-12 rounded-full ${COLORS[index % COLORS.length]} flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                        {index + 1 + ((page - 1) * 10)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-black text-lg mb-1" title={campaign.title}>{campaign.title?.length > 15 ? `${campaign.title.slice(0, 15)}...` : campaign.title}</h4>
                                        <div className="text-gray-500 text-sm flex flex-wrap items-center gap-2 md:gap-3">
                                            <span className="font-medium whitespace-nowrap">Winner : <span className="text-black font-semibold" title={campaign.winner?.user}>{campaign.winner?.user?.length > 20 ? `${campaign.winner.user.slice(0, 20)}...` : (campaign.winner?.user || 'N/A')}</span></span>
                                            <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="flex items-center gap-1.5 text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                {campaign.winner?.votesCount?.toLocaleString() || 0} votes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left md:text-right flex flex-col items-start md:items-end gap-1 w-full md:w-auto pl-0 md:pl-0 mt-2 md:mt-0">
                                    <div className="bg-[#fff7ed] text-[#ea580c] px-3 py-1 rounded-lg text-sm font-bold border border-[#ffedd5] inline-block shadow-sm">
                                        {campaign.pricePool ? `LKR ${campaign.pricePool.toLocaleString()}` : '$0'}
                                    </div>
                                    <p className="text-gray-400 text-xs font-medium">{campaign.completedAt ? dayjs(campaign.completedAt).format('YYYY-MM-DD') : 'Date N/A'}</p>
                                </div>
                            </div>
                        ))}
                        {total > 10 && (
                            <div className="mt-4 flex justify-end">
                                <CustomPagination
                                    current={page}
                                    total={total}
                                    pageSize={10}
                                    onChange={(newPage) => setPage(newPage)}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500">No campaigns found</div>
                )}
            </div>

            <WinnersModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                campaignId={selectedCampaign?.campaignId}
            />

            <CMSVideoModal
                open={videoModalOpen}
                onCancel={() => setVideoModalOpen(false)}
                videoUrl={selectedVideo?.videoUrl}
                title={selectedVideo?.title}
            />
        </div>
    );
}
