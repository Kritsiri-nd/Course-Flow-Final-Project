"use client";

export default function QRPaymentRedirect() {
    return (
        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">กำลังนำไปยังหน้า QR Code...</p>
            </div>
        </div>
    );
}
