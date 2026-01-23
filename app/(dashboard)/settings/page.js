'use client';
import React, { useState, useEffect, useContext } from 'react';
import { User, Lock, Bell, CheckSquare, Square } from 'lucide-react';
import { Input, Button } from 'antd';
import useLazyFetch from '@/app/hooks/useLazyFetch';
import { authAdmin } from '@/app/services/authService';
import { updateNotificationSettings, changePassword, updateProfileInformation } from '@/app/services/settingService';
import { UserContext } from '@/app/context/UserContext';
import { NotificationContext } from '@/app/context/NotificationContext';

export default function SettingsPage() {
    const { user, fetchUser } = useContext(UserContext);
    const { openNotification } = useContext(NotificationContext);

    const [notifications, setNotifications] = useState({
        // email: false,
        video: false,
        campaign: false,
        reports: false
    });

    const [profile, setProfile] = useState({
        fullName: '',
        userName: '',
        role: 'Super Admin'
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // const { trigger: getUser } = useLazyFetch(authAdmin); // No longer needed
    const { trigger: updateSettings } = useLazyFetch(updateNotificationSettings);
    const { trigger: updateProfile, loading: profileLoading } = useLazyFetch(updateProfileInformation);
    const { trigger: updatePassword, loading: passwordLoading } = useLazyFetch(changePassword);

    const formatRole = (role) => {
        if (!role) return 'Super Admin';
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                setProfile({
                    fullName: user.fullName || '',
                    userName: user.userName || '',
                    role: formatRole(user.type)
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const toggleNotification = async (key) => {
        const mapping = {
            // email: "EMAIL_NOTIFICATION",
            video: "VIDEO_MODERATION_ALERTS",
            campaign: "CAMPAIGN_REMINDERS",
            reports: "WEEKLY_REPORTS"
        };

        const currentTypes = [];
        // if (notifications.email) currentTypes.push(mapping.email);
        if (notifications.video) currentTypes.push(mapping.video);
        if (notifications.campaign) currentTypes.push(mapping.campaign);
        if (notifications.reports) currentTypes.push(mapping.reports);

        const typeToToggle = mapping[key];
        let newTypes = [...currentTypes];

        // Calculate the hypothetical new state for the clicked key
        const willBeChecked = !notifications[key];

        if (willBeChecked) {
            if (!newTypes.includes(typeToToggle)) newTypes.push(typeToToggle);
        } else {
            newTypes = newTypes.filter(t => t !== typeToToggle);
        }

        const response = await updateSettings({ notificationAlertType: newTypes }, { successMsg: true, errorMsg: true });

        if (response) {
            setNotifications(prev => ({ ...prev, [key]: willBeChecked }));
        }
    };

    const [validationErrors, setValidationErrors] = useState({});

    // ... (existing effects)

    const handleProfileUpdate = async () => {
        const errors = {};
        if (!profile.fullName || profile.fullName.trim().length < 3) {
            errors.fullName = "Full Name must be at least 3 characters long.";
        } else if (profile.fullName.length > 50) {
            errors.fullName = "Full Name cannot exceed 50 characters.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!profile.userName || !emailRegex.test(profile.userName)) {
            errors.userName = "Please enter a valid email address.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            openNotification("error", "Validation Error", "Please check the form for errors.");
            return;
        }

        setValidationErrors({}); // Clear errors

        const response = await updateProfile({
            fullName: profile.fullName,
            userName: profile.userName
        }, { successMsg: true, errorMsg: true });

        if (response?.data?.success) {
            fetchUser(); // Refresh user data in context
        }
    };

    const handlePasswordUpdate = async () => {
        const errors = {};
        if (!passwords.oldPassword) {
            errors.oldPassword = "Current password is required.";
        }
        if (!passwords.newPassword || passwords.newPassword.length < 6) {
            errors.newPassword = "New password must be at least 6 characters long.";
        }
        if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            if (errors.confirmPassword) {
                openNotification("error", "Validation Error", errors.confirmPassword);
            } else {
                openNotification("error", "Validation Error", "Please check the form for errors.");
            }
            return;
        }

        setValidationErrors({}); // Clear errors

        const response = await updatePassword(passwords, { successMsg: true, errorMsg: true });
        if (response?.data?.success) {
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1e1e2d] mb-1">Settings</h1>
                <p className="text-gray-500">Manage your account preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Profile Information */}
                <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="text-green-500" size={24} />
                        <h2 className="text-xl font-bold text-[#1e1e2d]">Profile Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <Input
                                placeholder="Full Name"
                                value={profile.fullName}
                                onChange={(e) => {
                                    setProfile({ ...profile, fullName: e.target.value });
                                    if (validationErrors.fullName) setValidationErrors({ ...validationErrors, fullName: null });
                                }}
                                status={validationErrors.fullName ? "error" : ""}
                                className="!bg-[#f9fafb] !border-gray-200 !h-12 !text-base !rounded-lg"
                            />
                            {validationErrors.fullName && <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <Input
                                placeholder="Email Address"
                                value={profile.userName}
                                onChange={(e) => {
                                    setProfile({ ...profile, userName: e.target.value });
                                    if (validationErrors.userName) setValidationErrors({ ...validationErrors, userName: null });
                                }}
                                status={validationErrors.userName ? "error" : ""}
                                className="!bg-[#f9fafb] !border-gray-200 !h-12 !text-base !rounded-lg"
                            />
                            {validationErrors.userName && <p className="text-red-500 text-xs mt-1">{validationErrors.userName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <div className="w-full h-12 flex items-center px-3 bg-[#eef8ff] rounded-lg text-[#1e1e2d] font-medium border border-transparent">
                                {profile.role}
                            </div>
                        </div>
                        <div className="pt-2">
                            <Button
                                type="primary"
                                onClick={handleProfileUpdate}
                                loading={profileLoading}
                                className="h-10 w-full bg-[#0000aa] hover:bg-[#000088] text-white font-medium rounded-lg"
                            >
                                Update Profile
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="text-green-500" size={24} />
                        <h2 className="text-xl font-bold text-[#1e1e2d]">Security</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                            <Input.Password
                                placeholder="********"
                                value={passwords.oldPassword}
                                onChange={(e) => {
                                    setPasswords({ ...passwords, oldPassword: e.target.value });
                                    if (validationErrors.oldPassword) setValidationErrors({ ...validationErrors, oldPassword: null });
                                }}
                                status={validationErrors.oldPassword ? "error" : ""}
                                className="!bg-[#f9fafb] !border-gray-200 !h-12 !text-base !rounded-lg"
                            />
                            {validationErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.oldPassword}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <Input.Password
                                placeholder="********"
                                value={passwords.newPassword}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPasswords({ ...passwords, newPassword: val });

                                    const errors = { ...validationErrors };
                                    if (val.length > 0 && val.length < 6) {
                                        errors.newPassword = "New password must be at least 6 characters long.";
                                    } else {
                                        delete errors.newPassword;
                                    }

                                    if (passwords.confirmPassword) {
                                        if (passwords.confirmPassword !== val) {
                                            errors.confirmPassword = "Passwords do not match.";
                                        } else {
                                            delete errors.confirmPassword;
                                        }
                                    }
                                    setValidationErrors(errors);
                                }}
                                status={validationErrors.newPassword ? "error" : ""}
                                className="!bg-[#f9fafb] !border-gray-200 !h-12 !text-base !rounded-lg"
                            />
                            {validationErrors.newPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.newPassword}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <Input.Password
                                placeholder="********"
                                value={passwords.confirmPassword}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPasswords({ ...passwords, confirmPassword: val });

                                    const errors = { ...validationErrors };
                                    if (passwords.newPassword && val !== passwords.newPassword) {
                                        errors.confirmPassword = "Passwords do not match.";
                                    } else {
                                        delete errors.confirmPassword;
                                    }
                                    setValidationErrors(errors);
                                }}
                                status={validationErrors.confirmPassword ? "error" : ""}
                                className="!bg-[#f9fafb] !border-gray-200 !h-12 !text-base !rounded-lg"
                            />
                            {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
                        </div>
                        <div className="pt-2">
                            <Button
                                type="primary"
                                onClick={handlePasswordUpdate}
                                loading={passwordLoading}
                                className="h-10 w-full bg-[#0000aa] hover:bg-[#000088] text-white font-medium rounded-lg"
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Bell className="text-green-500" size={24} />
                    <h2 className="text-xl font-bold text-[#1e1e2d]">Notification Preferences</h2>
                </div>

                <div className="space-y-6">
                    {/* <NotificationItem
                        title="Email Notifications"
                        description="Receive email updates about platform activity"
                        checked={notifications.email}
                        onChange={() => toggleNotification('email')}
                    /> */}
                    <NotificationItem
                        title="Video Moderation Alerts"
                        description="Get notified when videos need review"
                        checked={notifications.video}
                        onChange={() => toggleNotification('video')}
                    />
                    <NotificationItem
                        title="Campaign Reminders"
                        description="Reminders about upcoming campaigns"
                        checked={notifications.campaign}
                        onChange={() => toggleNotification('campaign')}
                    />
                    <NotificationItem
                        title="Weekly Reports"
                        description="Weekly summary of platform analytics"
                        checked={notifications.reports}
                        onChange={() => toggleNotification('reports')}
                    />
                </div>
            </div>
        </div>
    );
}

function NotificationItem({ title, description, checked, onChange }) {
    return (
        <div className="flex items-start gap-3 cursor-pointer" onClick={onChange}>
            <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[#0000aa] border-[#0000aa]' : 'bg-white border-gray-300'}`}>
                {checked && <CheckSquare size={16} className="text-white" />}
                {!checked && <span className="opacity-0"><Square size={16} /></span>}
            </div>
            <div>
                <h3 className="font-bold text-[#1e1e2d]">{title}</h3>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>
        </div>
    );
}

