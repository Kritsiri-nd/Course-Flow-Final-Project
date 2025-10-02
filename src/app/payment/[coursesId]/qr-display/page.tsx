"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabaseClient';

declare global {
    interface Window {
        Omise: any;
    }
}

export default function QRDisplayPage() {
    const params = useParams();
    const courseId = params?.coursesId;
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState<any>(null);
    const [qrData, setQrData] = useState<any>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [referenceNo, setReferenceNo] = useState<string>('');
    const [chargeId, setChargeId] = useState<string>('');
    const supabase = createClient();

    // Get user from Supabase
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, [supabase.auth]);


    // Get course data
    useEffect(() => {
        const getCourse = async () => {
            if (courseId) {
                try {
                    const res = await fetch(`/api/courses/${courseId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setCourse(data);
                    }
                } catch (error) {
                    console.error('Error fetching course:', error);
                }
            }
        };
        getCourse();
    }, [courseId]);


    // Generate QR Code
    useEffect(() => {
        if (course && !qrData && !loading) {
            generateQRCode();
        }
    }, [course]);

    // Check payment status periodically
    useEffect(() => {
        if (chargeId && paymentStatus === 'pending') {
            const interval = setInterval(() => {
                checkPaymentStatus();
            }, 3000); // Check every 3 seconds

            return () => clearInterval(interval);
        }
    }, [chargeId, paymentStatus]);

    const generateQRCode = async () => {
        console.log('generateQRCode called');
        console.log('userId:', userId);
        console.log('courseId:', courseId);
        console.log('course:', course);

        if (!userId || !courseId || !course) {
            console.log('Missing required data for QR generation');
            return;
        }

        setLoading(true);

        try {
            // Generate reference number
            const refNo = `CF${Date.now()}`;
            setReferenceNo(refNo);

            console.log('Creating PromptPay source with amount:', course.price * 100);

            // Create PromptPay source using our API
            const response = await fetch('/api/payment/create-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: course.price * 100, // Convert to satang
                    currency: 'thb',
                }),
            });

            const data = await response.json();
            console.log('QR API Response:', data);
            console.log('Response structure check:');
            console.log('- data.scannable_code:', data.scannable_code);
            console.log('- data.scannable_code?.image:', data.scannable_code?.image);

            if (!response.ok) {
                console.log('QR creation failed:', data.error);
                setPaymentStatus('failed');
                setLoading(false);
                return;
            }

            // Store charge ID for status checking
            if (data && data.id) {
                setChargeId(data.id);
                console.log('Charge ID:', data.id);
            }

            // Check different possible response structures
            if (data && data.source && data.source.scannable_code && data.source.scannable_code.image) {
                console.log('QR created successfully (source.scannable_code.image)');
                setQrData(data.source);
            } else if (data && data.scannable_code && data.scannable_code.image) {
                console.log('QR created successfully (scannable_code.image)');
                setQrData(data);
            } else if (data && data.source && data.source.image) {
                console.log('QR created successfully (source.image)');
                // Transform response to expected structure
                setQrData({
                    scannable_code: {
                        image: data.source.image
                    }
                });
            } else if (data && data.image) {
                console.log('QR created successfully (direct image)');
                // Transform response to expected structure
                setQrData({
                    scannable_code: {
                        image: data.image
                    }
                });
            } else {
                console.log('Invalid QR response structure:', data);
                console.log('Available keys:', Object.keys(data));
                if (data && data.source) {
                    console.log('Source keys:', Object.keys(data.source));
                }
                setPaymentStatus('failed');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error in generateQRCode:', error);
            setPaymentStatus('failed');
            setLoading(false);
        }
    };

    const checkPaymentStatus = async () => {
        if (!chargeId) return;

        try {
            console.log('Checking payment status for charge:', chargeId);
            
            const response = await fetch(`/api/payment/check-status?chargeId=${chargeId}`);
            const data = await response.json();
            
            console.log('Payment status response:', data);

            if (response.ok && data.paid) {
                console.log('Payment successful!');
                setPaymentStatus('success');
                // Auto redirect to success page after 2 seconds
                setTimeout(() => {
                    router.push(`/payment/${courseId}/success`);
                }, 2000);
            } else if (response.ok && data.status === 'failed') {
                console.log('Payment failed!');
                setPaymentStatus('failed');
            }
            // If still pending, continue checking
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    };

    const saveQRImage = () => {
        if (qrData && qrData.scannable_code && qrData.scannable_code.image) {
            const link = document.createElement('a');
            link.href = qrData.scannable_code.image.download_uri;
            link.download = `qr-payment-${referenceNo}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const goBackToPayment = () => {
        router.push(`/payment/${courseId}`);
    };

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <a href={`/payment/${courseId}`} className="text-blue-600 hover:text-blue-800 mb-6 inline-block">← Back</a>
                
                <div className="flex justify-center">
                    <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-8 max-w-md w-full">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">กำลังสร้าง QR Code...</p>
                            </div>
                        ) : paymentStatus === 'failed' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment failed</h3>
                                <p className="text-gray-600 mb-6">Please check your payment details and try again</p>
                                <button
                                    onClick={goBackToPayment}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
                                >
                                    Back to Payment
                                </button>
                            </div>
                        ) : paymentStatus === 'success' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                                <p className="text-gray-600 mb-4">Redirecting to order complete page...</p>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : qrData && qrData.scannable_code && qrData.scannable_code.image ? (
                            <div className="text-center space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">Scan QR code</h2>
                                
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Reference no. {referenceNo}</p>
                                    <p className="text-2xl font-bold text-orange-600">THB {course.price.toLocaleString()}.00</p>
                                </div>

                                <div className="flex justify-center">
                                    <img 
                                        src={qrData.scannable_code.image.download_uri} 
                                        alt="QR Code for payment"
                                        className="w-64 h-64 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <button
                                    onClick={saveQRImage}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
                                >
                                    Save QR image
                                </button>

                                <div className="text-xs text-gray-500">
                                    <p>QR Code นี้จะหมดอายุใน 15 นาที</p>
                                    <p>กำลังตรวจสอบสถานะการชำระเงิน...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <p className="text-gray-600">กำลังโหลด...</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <p>Debug Info:</p>
                                    <p>Loading: {loading ? 'Yes' : 'No'}</p>
                                    <p>QR Data: {qrData ? 'Yes' : 'No'}</p>
                                    <p>Payment Status: {paymentStatus}</p>
                                    <p>Course: {course ? 'Yes' : 'No'}</p>
                                    <p>User ID: {userId ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-blue-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold">CourseFlow</div>
                        <div className="flex space-x-6">
                            <a href="/non-user/courses" className="hover:text-blue-200">All Courses</a>
                            <a href="#" className="hover:text-blue-200">Bundle Package</a>
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                                <span className="text-xs">f</span>
                            </div>
                            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                                <span className="text-xs">ig</span>
                            </div>
                            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                                <span className="text-xs">tw</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
