import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Modal, Form, DatePicker, InputNumber } from 'antd';
import { Edit, Plus, X, Calendar } from 'lucide-react';
import { updateCampaign, validateCampaignTitle } from '@/app/services/campaignService';
import useLazyFetch from '@/app/hooks/useLazyFetch';
import useDebounce from '@/app/hooks/useDebounce';
import dayjs from 'dayjs';
const { TextArea } = Input;

export default function EditCampaign({ open, onCancel, onSuccess, campaign }) {
    const [editForm] = Form.useForm();
    const [isEditDirty, setIsEditDirty] = useState(false);
    const [initialFormValues, setInitialFormValues] = useState({});
    const [titleError, setTitleError] = useState('');
    const [isTitleValid, setIsTitleValid] = useState(null);
    const initialTitleRef = useRef(null);

    const { trigger: triggerUpdate, loading: updateLoading } = useLazyFetch(updateCampaign);
    const { trigger: triggerValidateTitle, loading: validatingTitle } = useLazyFetch(validateCampaignTitle);

    useEffect(() => {
        if (campaign && open) {
            editForm.resetFields();
            const values = {
                title: campaign.title,
                description: campaign.description,
                pricePool: campaign.pricePool,
                enrollStartTime: campaign.enrollStartTime ? dayjs(campaign.enrollStartTime) : null,
                reviewStartTime: campaign.reviewStartTime ? dayjs(campaign.reviewStartTime) : null,
                votingStartTime: campaign.votingStartTime ? dayjs(campaign.votingStartTime) : null,
                completeTime: campaign.completeTime ? dayjs(campaign.completeTime) : null,
                maxParticipants: campaign.maxParticipants || null,
                maxAgeLimit: campaign.maxAgeLimit || null,
                minAgeLimit: campaign.minAgeLimit || null,
                rules: campaign.campaignRules || [],
                status: campaign.status || '',
            };
            setInitialFormValues(values);
            editForm.setFieldsValue(values);
            setIsEditDirty(false);
            initialTitleRef.current = campaign.title;
            setIsTitleValid(null);
            setTitleError('');
        }
    }, [campaign, open, editForm]);

    useEffect(() => {
        if (campaign && !campaign.campaignRules) {
            editForm.setFieldValue('rules', []);
        }
    }, [campaign, editForm]);

    const watchedTitle = Form.useWatch('title', editForm);
    const debouncedTitle = useDebounce(watchedTitle, 500);

    useEffect(() => {
        const validateTitle = async () => {
            if (!open) return;

            if (!editForm.isFieldTouched('title')) return;

            if (!debouncedTitle || debouncedTitle.trim().length === 0) {
                setIsTitleValid(null);
                setTitleError('');
                return;
            }

            // If title hasn't changed from original, don't validate (it's valid)
            if (initialTitleRef.current === debouncedTitle) {
                setIsTitleValid(true);
                setTitleError('');
                return;
            }

            const res = await triggerValidateTitle({ title: debouncedTitle }, { successMsg: false, errorMsg: true });

            if (res?.data?.success) {
                setIsTitleValid(true);
                setTitleError('');
            } else {
                setIsTitleValid(false);
                setTitleError(res?.data?.message || 'Title is already taken or invalid');
            }
        };

        validateTitle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedTitle]);

    return (
        <Modal
            title={<div className="text-white flex items-center gap-2"><Edit size={18} /> Edit Campaign</div>}
            open={open}
            onCancel={onCancel}
            footer={null}
            styles={{ mask: { backdropFilter: 'blur(5px)' } }}
            closeIcon={<X className="text-white" />}
            width={700}
        >
            <Form
                form={editForm}
                requiredMark={false}
                layout="vertical"
                onValuesChange={(_, allValues) => {
                    if (!campaign) return;

                    const standardize = (val) => {
                        if (Array.isArray(val)) return JSON.stringify(val);
                        if (dayjs.isDayjs(val)) return val.toISOString();
                        if (val === null || val === undefined) return '';
                        return String(val).trim();
                    };

                    const isModified = Object.keys(initialFormValues).some(key => {

                        if (!Object.prototype.hasOwnProperty.call(allValues, key)) return false;
                        return standardize(allValues[key]) !== standardize(initialFormValues[key]);
                    });

                    setIsEditDirty(isModified);
                }}
                onFinish={async (values) => {
                    try {
                        const formatDate = (date) => date ? dayjs(date).toISOString() : null;

                        const payload = {
                            id: campaign.id,
                            title: values.title,
                            description: values.description,
                            pricePool: values.pricePool,
                            campaignImageUrl: campaign.campaignImageUrl,
                            enrollStartTime: formatDate(values.enrollStartTime),
                            reviewStartTime: formatDate(values.reviewStartTime),
                            votingStartTime: formatDate(values.votingStartTime),
                            completeTime: formatDate(values.completeTime),
                            maxParticipants: values.maxParticipants || null,
                            maxAgeLimit: values.maxAgeLimit || null,
                            minAgeLimit: values.minAgeLimit || null,
                            campaignRules: values.rules || []
                        };

                        const res = await triggerUpdate(payload, {
                            successMsg: true,
                            errorMsg: true
                        });

                        if (res?.data?.success) {
                            onSuccess();
                            onCancel();
                        }
                    } catch (error) {
                        console.error("Error updating campaign:", error);
                    }
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Form.Item
                            name="title"
                            label={<span className="text-white">Campaign Title *</span>}
                            rules={[
                                { required: true, message: 'Please enter campaign title' },
                                { min: 1, max: 100, message: 'Title must be between 1 and 100 characters' },
                                {
                                    validator: (_, value) => {
                                        if (value && !value.trim()) {
                                            return Promise.reject(new Error('Please enter a valid value'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input className="!bg-[#2e2e48] !border-[#444] !text-white" />
                        </Form.Item>
                        {/* {validatingTitle && <div className="text-blue-400 text-xs mt-1">Validating title...</div>} */}
                        {titleError && <div className="text-red-500 text-xs mt-1">{titleError}</div>}
                    </div>
                    <Form.Item
                        name="pricePool"
                        label={<span className="text-white">Price Pool *</span>}
                        rules={[{ required: true, message: 'Please enter price amount' }]}
                    >
                        <InputNumber
                            className="!w-full !bg-[#2e2e48] !border-[#444] !text-white input-number-dark"
                            maxLength={13}
                            prefix={<span className="text-gray-400 mr-2">LKR</span>}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\D/g, '')}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label={<span className="text-white">Description *</span>}
                    rules={[
                        { required: true, message: 'Please enter description' },
                        { min: 20, max: 300, message: 'Description must be between 20 and 300 characters' },
                        {
                            validator: (_, value) => {
                                if (value && !value.trim()) {
                                    return Promise.reject(new Error('Please enter a valid value'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <TextArea rows={3} minLength={20}
                        maxLength={300} className="!bg-[#2e2e48] !border-[#444] !text-white" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="enrollStartTime" label={<span className="text-white">Campaign Start Date *</span>} rules={[{ required: true, message: 'Campaign start date is required' }]}>
                        <DatePicker
                            showTime
                            className="w-full !bg-[#2e2e48] !border-[#444] !text-white disabled:!text-gray-200 disabled:!bg-[#28283d] disabled:!opacity-100"
                            suffixIcon={<Calendar className="text-white" size={16} />}
                            disabled={campaign?.enrollStartTime && !dayjs(campaign.enrollStartTime).isAfter(dayjs(), 'day')}
                        />
                    </Form.Item>
                    <Form.Item
                        name="reviewStartTime"
                        label={<span className="text-white">Review Start Date *</span>}
                        dependencies={['enrollStartTime']}
                        rules={[
                            { required: true, message: 'Required' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const start = getFieldValue('enrollStartTime');
                                    if (!value || !start || value.isAfter(start, 'day')) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Review start date must be after campaign start date'));
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            showTime
                            className="w-full !bg-[#2e2e48] !border-[#444] !text-white disabled:!text-gray-200 disabled:!bg-[#28283d] disabled:!opacity-100"
                            suffixIcon={<Calendar className="text-white" size={16} />}
                            disabled={campaign?.reviewStartTime && !dayjs(campaign.reviewStartTime).isAfter(dayjs(), 'day')}
                        />
                    </Form.Item>
                    <Form.Item
                        name="votingStartTime"
                        label={<span className="text-white">Voting Start Date *</span>}
                        dependencies={['reviewStartTime']}
                        rules={[
                            { required: true, message: 'Required' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const start = getFieldValue('reviewStartTime');
                                    if (!value || !start || value.isAfter(start, 'day')) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Voting start date must be after review start date'));
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            showTime
                            className="w-full !bg-[#2e2e48] !border-[#444] !text-white disabled:!text-gray-200 disabled:!bg-[#28283d] disabled:!opacity-100"
                            suffixIcon={<Calendar className="text-white" size={16} />}
                            disabled={campaign?.votingStartTime && !dayjs(campaign.votingStartTime).isAfter(dayjs(), 'day')}
                        />
                    </Form.Item>
                    <Form.Item
                        name="completeTime"
                        label={<span className="text-white">Complete Date *</span>}
                        dependencies={['votingStartTime']}
                        rules={[
                            { required: true, message: 'Required' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const start = getFieldValue('votingStartTime');
                                    if (!value || !start || value.isAfter(start, 'day')) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Complete date must be after voting start date'));
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            showTime
                            className="w-full !bg-[#2e2e48] !border-[#444] !text-white disabled:!text-gray-200 disabled:!bg-[#28283d] disabled:!opacity-100"
                            suffixIcon={<Calendar className="text-white" size={16} />}
                            disabled={campaign?.completeTime && !dayjs(campaign.completeTime).isAfter(dayjs(), 'day')}
                        />
                    </Form.Item>
                </div>



                <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                        name="maxParticipants"
                        label={<span className="text-white">Max Participants</span>}
                        rules={[
                            { required: false },
                            {
                                validator: (_, value) => {
                                    if (value && parseInt(value) <= 0) {
                                        return Promise.reject(new Error('Maximum participants must be greater than 0'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <InputNumber maxLength={4} placeholder="Leave empty for unlimited" className="!w-full !bg-[#2e2e48] !border-[#444] !text-white" />
                    </Form.Item>
                    <Form.Item name="minAgeLimit" label={<span className="text-white">Min Age</span>} rules={[{ required: false, message: 'Required' }]}>
                        <InputNumber maxLength={2} placeholder="No restriction" className="!w-full !bg-[#2e2e48] !border-[#444] !text-white" />
                    </Form.Item>
                    <Form.Item
                        name="maxAgeLimit"
                        label={<span className="text-white">Max Age</span>}
                        dependencies={['minAgeLimit']}
                        rules={[
                            { required: false },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const min = getFieldValue('minAgeLimit');
                                    if (value && min && parseInt(value) <= parseInt(min)) {
                                        return Promise.reject(new Error('Maximum age must be greater than minimum age'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber maxLength={2} placeholder="No restriction" className="!w-full !bg-[#2e2e48] !border-[#444] !text-white" />
                    </Form.Item>
                </div>

                <Form.List name="rules">
                    {(fields, { add, remove }) => (
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white">Campaign Rules</span>
                                <Button type="dashed" onClick={() => add()} size="small" icon={<Plus size={14} />} className="!text-white !border-[#444] !bg-black p-2">
                                    Add Rule
                                </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {fields.map((field, index) => (
                                    <div key={field.key} className="flex gap-2">
                                        <Form.Item
                                            name={field.name}
                                            noStyle
                                        >
                                            <Input maxLength={100}
                                                className="!bg-[#2e2e48] !border-[#444] !text-white" placeholder="Rule" />
                                        </Form.Item>
                                        <Button
                                            type="text"
                                            onClick={() => remove(field.name)}
                                            className="!text-red-500 hover:!bg-red-500/10"
                                            icon={<X size={16} />}
                                        />
                                    </div>
                                ))}
                                {fields.length === 0 && <div className="text-gray-500 text-sm">No rules defined</div>}
                            </div>
                        </div>
                    )}
                </Form.List>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                    <Button onClick={onCancel} className="!bg-white !border-gray-300 !text-black !h-11 font-medium">
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={updateLoading} disabled={!isEditDirty || validatingTitle || isTitleValid === false} className="!bg-[#0000aa] !border-none !h-11 font-medium hover:!bg-[#0000cc] !text-white disabled:!text-gray-300 disabled:!bg-[#0000aa]/50">
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
