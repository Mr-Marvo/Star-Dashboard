import React, { useEffect, useState } from 'react';
import { Modal, Avatar, Spin } from 'antd';
import { X, Trophy, Eye, Heart } from 'lucide-react';
import CustomPagination from '@/components/CustomPagination';
import { getCampaignTopWinners, getOtherCampaignParticipants } from '@/app/services/winnerService';

export default function WinnersModal({ open, onCancel, campaignId }) {
    const [loading, setLoading] = useState(false);
    const [participantsLoading, setParticipantsLoading] = useState(false);
    const [campaignData, setCampaignData] = useState(null);
    const [topWinners, setTopWinners] = useState({ firstWinner: {}, secondWinner: {}, thirdWinner: {} });
    const [otherParticipants, setOtherParticipants] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });

    useEffect(() => {
        if (open && campaignId) {
            fetchTopWinners();
            fetchOtherParticipants(1);
        } else {
            setCampaignData(null);
            setTopWinners({ firstWinner: {}, secondWinner: {}, thirdWinner: {} });
            setOtherParticipants([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, campaignId]);

    const fetchTopWinners = async () => {
        setLoading(true);
        try {
            const res = await getCampaignTopWinners(campaignId);
            if (res.data.success) {
                setCampaignData(res.data.data.campaignData);
                setTopWinners(res.data.data.topWinners);
            }
        } catch (error) {
            console.error("Failed to fetch top winners", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOtherParticipants = async (page) => {
        setParticipantsLoading(true);
        try {
            const res = await getOtherCampaignParticipants(page, 10, campaignId);
            if (res.data.success) {
                setOtherParticipants(res.data.data.data);
                setPagination({
                    page: res.data.data.page,
                    perPage: res.data.data.perPage,
                    total: res.data.data.total
                });
            }
        } catch (error) {
            console.error("Failed to fetch participants", error);
        } finally {
            setParticipantsLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchOtherParticipants(page);
    };

    // Helper to handle avatar src safely
    const getAvatarSrc = (src) => (src && src.trim() !== "" ? src : null);

    const { firstWinner, secondWinner, thirdWinner } = topWinners;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closeIcon={null}
            width={800}
            centered
            className="winner-modal"
            styles={{
                content: { padding: 0, borderRadius: '16px', overflow: 'hidden', border: 'none' },
                body: { padding: 0 },
                mask: { backdropFilter: 'blur(2px)' }
            }}
        >
            {loading || !campaignData ? (
                <div className="h-[400px] flex items-center justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <div className="bg-[#ecfdf5] p-6 relative">
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-200/50 transition-colors z-10"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-[#af00af] flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0">
                                {campaignData.title?.charAt(0)}
                            </div>

                            <h2 className="text-2xl font-bold text-black mb-1.5">{campaignData.title}</h2>
                        </div>

                        <div className='pt-3'>
                            <div className="flex items-center gap-3 text-sm text-[#64748b] font-medium">
                                <span>Ended: {campaignData.completeTime ? new Date(campaignData.completeTime).toLocaleDateString() : 'N/A'}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]"></span>
                                <span>{campaignData.enrolledCount?.toLocaleString()} Participants</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]"></span>
                                <span className="text-[#eab308] font-semibold">Prize: LKR {campaignData.pricePool?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 bg-white">
                        <div className="flex justify-center items-end gap-6 pt-10 pb-12 mb-4 mx-6">

                            {/* Second Winner */}
                            {secondWinner?.user && (
                                <div className="flex flex-col items-center relative z-10 w-44">
                                    <div className="relative mb-3">
                                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-[#9ca3af]">
                                            <Avatar size={72} src={getAvatarSrc(secondWinner?.profilePicture)} className="bg-[#9ca3af] text-xl font-bold">{secondWinner?.user ? secondWinner.user.substring(0, 2).toUpperCase() : "NA"}</Avatar>
                                        </div>
                                        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-8 h-8 rounded-full bg-[#64748b] border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-sm z-20">
                                            2
                                        </div>
                                    </div>

                                    <div className="text-center w-full">
                                        <h3 className="font-bold text-lg text-black leading-tight mb-1" title={secondWinner?.user}>{secondWinner?.user?.length > 10 ? `${secondWinner.user.slice(0, 10)}...` : secondWinner.user}</h3>
                                        <p className="text-[#94a3b8] text-xs mb-4 font-medium px-2 truncate w-full">{secondWinner?.title || '-'}</p>

                                        <div className="bg-[#64748b] text-white rounded-2xl py-5 px-2 shadow-sm text-center w-full relative h-[120px] flex flex-col justify-center items-center mb-3">
                                            <Trophy className="w-6 h-6 text-gray-300 mb-2" strokeWidth={1.5} />
                                            <div className="text-2xl font-bold leading-none mb-1 text-white">{secondWinner?.votesCount?.toLocaleString() || 0}</div>
                                            <div className="text-[10px] text-gray-300 font-medium tracking-wide">Votes</div>
                                        </div>

                                        <div className="bg-white border border-gray-100 rounded-lg py-2 px-3 shadow-sm flex items-center justify-center gap-2 w-full">
                                            <Eye className="w-4 h-4 text-[#8b5cf6]" />
                                            <span className="text-black font-bold text-sm">{secondWinner?.viewsCount?.toLocaleString() || 0}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">Views</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* First Winner */}
                            {firstWinner?.user && (
                                <div className="flex flex-col items-center relative z-20 w-52 -mt-10">
                                    <div className="relative mb-3">
                                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#fbbf24]">
                                            <Avatar size={88} src={getAvatarSrc(firstWinner?.profilePicture)} className="bg-[#fbbf24] text-3xl font-bold text-white">{firstWinner?.user ? firstWinner.user.substring(0, 2).toUpperCase() : "NA"}</Avatar>
                                        </div>
                                        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-10 h-10 rounded-full bg-[#fbbf24] border-2 border-white flex items-center justify-center text-white shadow-sm z-20">
                                            <Trophy size={18} fill="white" strokeWidth={0} />
                                        </div>
                                    </div>

                                    <div className="text-center w-full">
                                        <h3 className="font-bold text-xl text-black leading-tight mb-1" title={firstWinner?.user}>{firstWinner?.user?.length > 10 ? `${firstWinner.user.slice(0, 10)}...` : firstWinner.user}</h3>
                                        <div className="flex justify-center mb-1">
                                            <span className="border border-[#fbbf24] text-[#d97706] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide bg-orange-50 flex items-center gap-1">
                                                <Trophy size={10} strokeWidth={2} /> Champion
                                            </span>
                                        </div>
                                        <p className="text-[#94a3b8] text-sm mb-4 font-medium px-2 truncate w-full">{firstWinner?.title || '-'}</p>

                                        <div className="bg-[#fbbf24] text-white rounded-2xl py-6 px-2 shadow-lg shadow-orange-200 text-center w-full relative h-[140px] flex flex-col justify-center items-center mb-3">
                                            <Trophy className="w-8 h-8 text-white mb-2" strokeWidth={1.5} />
                                            <div className="text-4xl font-bold leading-none mb-1 text-white">{firstWinner?.votesCount?.toLocaleString() || 0}</div>
                                            <div className="text-xs text-orange-50 font-medium tracking-wide">Votes</div>
                                        </div>

                                        <div className="bg-white border border-gray-100 rounded-lg py-2 px-3 shadow-sm flex items-center justify-center gap-2 w-full">
                                            <Eye className="w-4 h-4 text-[#8b5cf6]" />
                                            <span className="text-black font-bold text-sm">{firstWinner?.viewsCount?.toLocaleString() || 0}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">Views</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Third Winner */}
                            {thirdWinner?.user && (
                                <div className="flex flex-col items-center relative z-10 w-44">
                                    <div className="relative mb-3">
                                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-[#ef4444]">
                                            <Avatar size={72} src={getAvatarSrc(thirdWinner?.profilePicture)} className="bg-[#ef4444] text-xl font-bold text-white">{thirdWinner?.user ? thirdWinner.user.substring(0, 2).toUpperCase() : "NA"}</Avatar>
                                        </div>
                                        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-8 h-8 rounded-full bg-[#ef4444] border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-sm z-20">
                                            3
                                        </div>
                                    </div>

                                    <div className="text-center w-full">
                                        <h3 className="font-bold text-lg text-black leading-tight mb-1" title={thirdWinner?.user}>{thirdWinner?.user?.length > 10 ? `${thirdWinner.user.slice(0, 10)}...` : thirdWinner.user}</h3>
                                        <p className="text-[#94a3b8] text-xs mb-4 font-medium px-2 truncate w-full">{thirdWinner?.title || '-'}</p>

                                        <div className="bg-[#ff0000] text-white rounded-2xl py-5 px-2 shadow-sm text-center w-full relative h-[120px] flex flex-col justify-center items-center mb-3">
                                            <Trophy className="w-6 h-6 text-red-200 mb-2" strokeWidth={1.5} />
                                            <div className="text-2xl font-bold leading-none mb-1 text-white">{thirdWinner?.votesCount?.toLocaleString() || 0}</div>
                                            <div className="text-[10px] text-red-100 font-medium tracking-wide">Votes</div>
                                        </div>

                                        <div className="bg-white border border-gray-100 rounded-lg py-2 px-3 shadow-sm flex items-center justify-center gap-2 w-full">
                                            <Eye className="w-4 h-4 text-[#8b5cf6]" />
                                            <span className="text-black font-bold text-sm">{thirdWinner?.viewsCount?.toLocaleString() || 0}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">Views</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-6 pt-2">
                            <h4 className="text-[#64748b] text-sm font-medium mb-4">Other Participants</h4>
                            {participantsLoading ? (
                                <div className="text-center py-8">
                                    <Spin />
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {otherParticipants && otherParticipants.length > 0 ? otherParticipants.map((p, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#f1f5f9] text-[#94a3b8] rounded-xl flex items-center justify-center font-bold text-sm">
                                                        #{((pagination.page - 1) * pagination.perPage) + index + 4}
                                                    </div>
                                                    <Avatar src={getAvatarSrc(p.profilePicture)} size={42} className="bg-[#ec4899] text-white text-lg font-bold">{p.user ? p.user.substring(0, 2).toUpperCase() : "NA"}</Avatar>
                                                    <div>
                                                        <div className="font-bold text-black text-base" title={p.user}>
                                                            {p.user?.length > 20 ? `${p.user.slice(0, 20)}...` : (p.user || 'N/A')}
                                                        </div>
                                                        <div className="text-[#94a3b8] text-xs mt-0.5" title={p.title}>
                                                            {p.title?.length > 15 ? `${p.title.slice(0, 15)}...` : (p.title || 'N/A')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 pr-2">
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            <Eye size={16} className="text-[#8b5cf6]" />
                                                            <span className="text-sm font-bold text-black leading-none">{p.viewsCount?.toLocaleString() || 0}</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-medium mt-0.5">Views</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            <Heart size={16} className="text-[#ec4899]" fill="#ec4899" />
                                                            <span className="text-sm font-bold text-black leading-none">{p.votesCount?.toLocaleString() || 0}</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-medium mt-0.5">Votes</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center text-gray-400 py-4">No other participants found</div>
                                        )}
                                    </div>


                                    {pagination.total > pagination.perPage && (
                                        <CustomPagination
                                            current={pagination.page}
                                            total={pagination.total}
                                            pageSize={pagination.perPage}
                                            onChange={handlePageChange}
                                            className="mt-2"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .winner-modal .ant-modal-content {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </Modal>
    );
}
