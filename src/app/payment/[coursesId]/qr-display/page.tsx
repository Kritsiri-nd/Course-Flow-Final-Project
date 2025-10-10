"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { createClient } from '@/lib/supabaseClient';
import Link from "next/link";
import Footer from "@/components/ui/footer";
import BackgroundImage from "@/components/ui/background-image";
import { Button } from "@/components/ui/button";
import { LuArrowLeft } from "react-icons/lu";

declare global {
  interface Window {
    Omise: {
      setPublicKey: (key: string) => void;
      createSource: (type: string, params: Record<string, unknown>, callback: (status: number, response: unknown) => void) => void;
      createToken: (type: string, params: Record<string, unknown>, callback: (status: number, response: unknown) => void) => void;
    };
  }
}

export default function QRDisplayPage() {
  const params = useParams();
  const courseId = params?.coursesId;
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<{ id: number; title: string; price: number; currency: string } | null>(null);
  const [qrData, setQrData] = useState<{ scannable_code?: { image?: { download_uri: string } } } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [chargeId, setChargeId] = useState<string>('');
  const [qrCreatedAt, setQrCreatedAt] = useState<number | null>(null);
  const [isQrExpired, setIsQrExpired] = useState(false);
  const supabase = createClient();

  // Get URL search params for existing QR data
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const existingChargeId = searchParams?.get('chargeId');
  const existingReferenceNo = searchParams?.get('referenceNo');
  const existingQrUrl = searchParams?.get('qrUrl');
  const existingCreatedAt = searchParams?.get('createdAt');

  // Check if QR code is expired (Omise QR codes expire after 15 minutes)
  const checkQrExpiration = useCallback((createdAt: number) => {
    const now = Date.now();
    const qrAge = now - createdAt;
    const expirationTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    return qrAge > expirationTime;
  }, []);

  // Initialize existing QR data if available
  useEffect(() => {
    if (existingChargeId && existingReferenceNo && existingQrUrl && existingCreatedAt) {
      const createdAt = parseInt(existingCreatedAt);
      const isExpired = checkQrExpiration(createdAt);

      if (!isExpired) {
        // Use existing QR data
        setChargeId(existingChargeId);
        setReferenceNo(existingReferenceNo);
        setQrCreatedAt(createdAt);
        setQrData({
          scannable_code: {
            image: { download_uri: existingQrUrl }
          }
        });
      } else {
        setIsQrExpired(true);
      }
    }
  }, [existingChargeId, existingReferenceNo, existingQrUrl, existingCreatedAt, checkQrExpiration]);

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


  const generateQRCode = useCallback(async () => {
    if (!userId || !courseId || !course) {
      return;
    }

    setLoading(true);

    try {
      // Generate reference number
      const refNo = `CF${Date.now()}`;
      setReferenceNo(refNo);
      const createdAt = Date.now();
      setQrCreatedAt(createdAt);

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

      if (!response.ok) {
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      // Store charge ID for status checking
      if (data && data.id) {
        setChargeId(data.id);

        // Save payment record to database
        try {
          const paymentResponse = await fetch('/api/payment/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              course_id: parseInt(courseId as string),
              user_id: userId,
              method: 'promptpay',
              charge_id: data.id
            })
          });
        } catch (error) {
          console.error('Error saving payment record:', error);
        }
      }

      let qrImageUrl = '';

      // Check different possible response structures
      if (data && data.source && data.source.scannable_code && data.source.scannable_code.image) {
        setQrData(data.source);
        qrImageUrl = data.source.scannable_code.image.download_uri || data.source.scannable_code.image;
      } else if (data && data.scannable_code && data.scannable_code.image) {
        setQrData(data);
        qrImageUrl = data.scannable_code.image.download_uri || data.scannable_code.image;
      } else if (data && data.source && data.source.image) {
        qrImageUrl = data.source.image.download_uri || data.source.image;
        setQrData({
          scannable_code: {
            image: data.source.image
          }
        });
      } else if (data && data.image) {
        qrImageUrl = data.image.download_uri || data.image;
        setQrData({
          scannable_code: {
            image: data.image
          }
        });
      } else {
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      // Update URL with QR parameters for persistence
      if (qrImageUrl && data.id) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('chargeId', data.id);
        newUrl.searchParams.set('referenceNo', refNo);
        newUrl.searchParams.set('qrUrl', qrImageUrl);
        newUrl.searchParams.set('createdAt', createdAt.toString());

        // Update URL without causing a page reload
        window.history.replaceState({}, '', newUrl.toString());
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in generateQRCode:', error);
      setPaymentStatus('failed');
      setLoading(false);
    }
  }, [userId, courseId, course]);

  // Simple polling: Check enrollment status every 3 seconds
  useEffect(() => {
    if (chargeId && userId && courseId && paymentStatus === 'pending') {
      console.log('🔍 Starting enrollment check polling...');

      const interval = setInterval(async () => {
        try {
          // ใช้ API Route แทน Direct Supabase Query
          const response = await fetch(`/api/payment/check-enrollment?userId=${userId}&courseId=${courseId}`);
          const data = await response.json();

          if (response.ok && data.enrolled) {
            console.log('✅ Enrollment found! Payment was successful.');
            setPaymentStatus('success');

            // Auto redirect to success page after 2 seconds
            setTimeout(() => {
              console.log('🎉 Redirecting to success page...');
              router.push(`/payment/${courseId}/success`);
            }, 2000);

            clearInterval(interval);
          } else if (response.ok && data.paymentStatus === 'failed') {
            console.log('❌ Payment failed detected!');
            setPaymentStatus('failed');
            clearInterval(interval);
          } else {
            console.log('⏳ Payment still pending... checking again in 3 seconds');
          }
        } catch (error) {
          console.error('Error checking enrollment:', error);
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [chargeId, userId, courseId, paymentStatus, router, supabase]);

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

  const generateNewQRCode = () => {
    // Clear existing data and generate new QR
    setQrData(null);
    setChargeId('');
    setReferenceNo('');
    setQrCreatedAt(null);
    setIsQrExpired(false);
    setPaymentStatus('pending');

    // Clear URL parameters
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('chargeId');
    newUrl.searchParams.delete('referenceNo');
    newUrl.searchParams.delete('qrUrl');
    newUrl.searchParams.delete('createdAt');
    window.history.replaceState({}, '', newUrl.toString());

    generateQRCode();
  };

  // Check QR expiration periodically
  useEffect(() => {
    if (qrCreatedAt && !isQrExpired) {
      const interval = setInterval(() => {
        const isExpired = checkQrExpiration(qrCreatedAt);
        if (isExpired) {
          setIsQrExpired(true);
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [qrCreatedAt, isQrExpired, checkQrExpiration]);

  // Generate QR Code only if no existing QR or if expired
  useEffect(() => {
    if (course && !qrData && !loading) {
      if (!existingChargeId) {
        generateQRCode();
      } else if (isQrExpired) {
        generateQRCode();
      }
    }
  }, [course, qrData, loading, generateQRCode, existingChargeId, isQrExpired]);

  // Webhook will handle payment status updates automatically
  // No need for polling anymore

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
    <div className="min-h-screen  flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {paymentStatus !== "failed" ? (
            <>
              {/* Back Button */}
              <div className="border-none mb-3">
                <div className="max-w-[1240px] mx-auto">
                  <Link href={`/payment/${courseId}`}>
                    <Button variant="ghost" className="gap-2 text-b2 text-blue-500">
                      <LuArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="mb-15"></div>
          )}

          {/* ✅ กล่อง QR Code อยู่กลางแนวนอน */}
          <div className="flex justify-center">
            {/* Background - แสดงเฉพาะตอน fail */}
            {paymentStatus === "failed" && (
              <BackgroundImage
                src="/assets/bg-image.png"
                alt="background"
                className="absolute object-cover -z-10 hidden lg:block"
              />
            )}
            <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-[739px] text-center">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">กำลังสร้าง QR Code...</p>
                </div>
              ) : paymentStatus === "failed" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#9B2FAC] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-h3 font-medium text-black mb-2">
                    Payment failed
                  </h3>
                  <p className="text-b2 font-regular text-gray-700 mb-10 leading-8">
                    Please check your payment details and try again
                  </p>
                  <button
                    onClick={goBackToPayment}
                    className="w-full max-w-[321px] bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600"
                  >
                    Back to Payment
                  </button>
                </div>
              ) : paymentStatus === "success" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Redirecting to order complete page...
                  </p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : qrData?.scannable_code?.image && !isQrExpired ? (
                <div className="space-y-6">
                  <h2 className="text-h3 font-medium text-black">Scan QR code</h2>

                  <div className="space-y-2">
                    <p className="text-b2 font-regular text-gray-600">
                      Reference no. {referenceNo}
                    </p>
                    <p className="text-h3 font-medium text-orange-500">
                      THB {course.price.toLocaleString()}.00
                    </p>
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
                    className="w-full max-w-[312px] bg-blue-600 text-white py-4 px-4 rounded-md hover:bg-blue-700"
                  >
                    Save QR image
                  </button>
                </div>
              ) : isQrExpired ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    QR Code Expired
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This QR code has expired. Please generate a new one to continue payment.
                  </p>
                  <button
                    onClick={generateNewQRCode}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
                  >
                    Generate New QR Code
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-gray-600">กำลังโหลด...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

}
