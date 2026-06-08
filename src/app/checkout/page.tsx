"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CreditCard, ScanLine, ArrowLeft, ShieldCheck, MapPin, Calendar, CheckCircle2, X, Tag, WifiOff } from 'lucide-react';
import { fetchWithRetry, NetworkError } from '@/lib/fetchWithRetry';
import Image from 'next/image';

interface ClientProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Booking Details from URL
    const serviceId = searchParams.get('serviceId');
    const locationId = searchParams.get('locationId');
    const packageName = searchParams.get('packageName');
    const pujaId = searchParams.get('pujaId'); // NEW
    const puriPujaId = searchParams.get('puriPujaId');
    const source = searchParams.get('source');
    const urlPrice = searchParams.get('price');

    // State
    const [client, setClient] = useState<ClientProfile | null>(null);
    const [serviceName, setServiceName] = useState("");
    const [locationName, setLocationName] = useState("");
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'qr'>('razorpay'); // Default to Razorpay
    const [isProcessing, setIsProcessing] = useState(false);
    const [fetchedPrice, setFetchedPrice] = useState<number>(0);

    // QR Payment State
    const [showQRModal, setShowQRModal] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [qrError, setQrError] = useState("");
    const [imageError, setImageError] = useState(false); // Track if specific QR exists

    // Error Modal State
    const [showErrorModal, setShowErrorModal] = useState(false);

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Pricing Logic
    const basePrice = fetchedPrice;

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Network resilience state
    const [networkError, setNetworkError] = useState("");
    const bookingInProgress = useRef(false); // Prevents duplicate booking submissions

    // Calculate GST on the discounted price or base price? 
    // Usually GST is on the final taxable value. 
    // If discount is applied on base price: (Base - Discount) + GST
    // Let's assume discount reduces taxable amount.
    const taxableAmount = Math.max(0, basePrice - discountAmount);
    const gstRate = 0;
    const gstAmount = taxableAmount * gstRate;
    const totalAmount = taxableAmount + gstAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }
        setCouponError("");
        setVerifying(true);

        try {
            const res = await fetch("/api/coupons/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, orderTotal: basePrice })
            });

            const data = await res.json();

            if (res.ok) {
                setAppliedCoupon(data.data);
                setDiscountAmount(data.data.discountAmount);
                setCouponError("");
            } else {
                setCouponError(data.error || "Invalid coupon");
                setAppliedCoupon(null);
                setDiscountAmount(0);
            }
        } catch (error) {
            setCouponError("Failed to verify coupon");
        } finally {
            setVerifying(false); // Use independent verify state
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode("");
        setCouponError("");
    };

    useEffect(() => {
        const initCheckout = async () => {
            try {
                setNetworkError("");

                // 1. Fetch User Profile (no retry — auth check)
                const userRes = await fetchWithRetry("/api/client/me", { retries: 1 });
                if (!userRes.ok) {
                    // Preserve all current search parameters for the redirect
                    const currentParams = searchParams.toString();
                    const redirectUrl = currentParams ? `/checkout?${currentParams}` : '/checkout';
                    router.push(`/client/login?redirect=${encodeURIComponent(redirectUrl)}`); // Handle auth expiry
                    return;
                }
                const userData = await userRes.json();
                setClient(userData);

                // --- NEW: Puri Puja Flow ---
                if (source === 'puri-puja') {
                    setServiceName(packageName || "Puri Puja");
                    setLocationName("Jagannath Temple, Puri");
                    if (urlPrice) {
                        setFetchedPrice(Number(urlPrice));
                    }
                    setLoading(false);
                    return;
                }
                // -----------------------------

                // --- NEW: Puja Booking Flow ---
                if (pujaId) {
                    const pRes = await fetchWithRetry('/api/puja');
                    if (pRes.ok) {
                        const pData = await pRes.json();
                        // @ts-ignore
                        const foundPuja = pData.data.find((p: any) => p._id === pujaId);

                        if (foundPuja) {
                            setServiceName(foundPuja.name);
                            setLocationName(foundPuja.location);

                            // Find service matching serviceId from URL (preferred), else use first service
                            const targetService = serviceId
                                ? foundPuja.services?.find((svc: any) => {
                                    if (!svc || !svc.service) return false;
                                    const sId = typeof svc.service === 'object' ? svc.service._id : svc.service;
                                    return String(sId) === String(serviceId);
                                }) || foundPuja.services?.[0]
                                : foundPuja.services?.[0];

                            if (targetService) {
                                const packages = targetService.packages || [];
                                // Match by name if provided; otherwise use first package as fallback
                                const foundPackage = packageName
                                    ? packages.find((p: any) => p.name === packageName) || packages[0]
                                    : packages[0];

                                if (foundPackage) {
                                    setFetchedPrice(foundPackage.priceAmount);
                                } else {
                                    console.error("Could not find any package in service for puja", pujaId);
                                }
                            } else {
                                console.error("Could not find any service in puja", pujaId);
                            }
                        }
                    }
                    setLoading(false);
                    return; // Skip existing service/location logic
                }
                // -----------------------------


                // 2. Fetch Service Name
                if (serviceId) {
                    const sRes = await fetchWithRetry('/api/services');
                    const services = await sRes.json();
                    const s = services.find((i: any) => i._id === serviceId);
                    if (s) setServiceName(s.name);
                }

                // 3. Fetch Location & Validate Price
                if (locationId) {
                    const lRes = await fetchWithRetry('/api/locations');
                    const locations = await lRes.json();
                    const l = locations.find((i: any) => i._id === locationId);
                    if (l) {
                        setLocationName(l.name);

                        // SECURE PRICE LOOKUP
                        if (serviceId && packageName) {
                            const serviceEntry = l.services.find((s: any) =>
                                (typeof s.service === 'string' ? s.service : s.service._id) === serviceId
                            );

                            if (serviceEntry) {
                                const packageEntry = serviceEntry.pricing.find((p: any) =>
                                    p.name === packageName
                                );

                                if (packageEntry) {
                                    setFetchedPrice(packageEntry.price);
                                }
                            }
                        }
                    }
                }

            } catch (error: any) {
                console.error("Checkout init error:", error);
                if (error instanceof NetworkError) {
                    setNetworkError(error.isRetryExhausted
                        ? "Request failed after retry. Please check your network and refresh."
                        : error.isTimeout
                            ? "Slow network detected. Please try refreshing."
                            : error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        initCheckout();
    }, [router, serviceId, locationId, packageName, pujaId, puriPujaId, source, urlPrice]);

    const handlePayment = async () => {

        if (paymentMethod === 'razorpay') {
            setIsProcessing(true);
            try {
                // Create order on backend
                const orderRes = await fetch("/api/bookings/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: totalAmount })
                });

                const order = await orderRes.json();

                if (!orderRes.ok) throw new Error(order.error);

                // Initialize Razorpay
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    order_id: order.id,
                    amount: order.amount,
                    currency: "INR",
                    name: "Manima Spiritual Services",
                    description: `${serviceName} - ${packageName}`,
                    handler: (response: any) => {
                        // Payment successful
                        processBooking(response.razorpay_payment_id, {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                    },
                    prefill: {
                        name: client?.name,
                        email: client?.email,
                        contact: client?.phone,
                    },
                    theme: {
                        color: "#D35400",
                    },
                    modal: {
                        ondismiss: () => {
                            setIsProcessing(false);
                        }
                    }
                };

                const razorpayWindow = (window as any).Razorpay;
                const rzp1 = new razorpayWindow(options);
                rzp1.open();
            } catch (error) {
                console.error(error);
                setShowErrorModal(true);
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        if (paymentMethod === 'qr') {
            setImageError(false); // Reset error state on open
            setShowQRModal(true);
            return;
        }

        // Fallback or future method
        await processBooking();
    };

    const processBooking = async (
        txnId?: string,
        razorpayVerification?: { razorpayOrderId?: string; razorpaySignature?: string }
    ) => {
        // --- DUPLICATE SUBMISSION GUARD (Tasks 4, 9, 10) ---
        if (bookingInProgress.current) return;
        bookingInProgress.current = true;
        setIsProcessing(true);
        setNetworkError("");

        try {
            const bookingData: any = {
                client: client?._id,
                package: packageName,
                price: totalAmount, // Use totalAmount which includes GST if applicable
                priceCategory: packageName, // Assuming this maps to priceCategory in schema
                paymentMethod,
                transactionId: txnId || undefined,
                ...razorpayVerification,
            };

            // Conditionally add fields
            if (pujaId) {
                bookingData.puja = pujaId;
                if (serviceId) {
                    bookingData.pujaService = serviceId;
                }
            } else if (source === 'puri-puja' && puriPujaId) {
                bookingData.puriPuja = puriPujaId;
            } else {
                bookingData.service = serviceId;
                bookingData.location = locationId;
            }


            const res = await fetchWithRetry('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
                retries: 0, // No retry for mutations to prevent duplicates
            });

            if (res.ok) {
                const data = await res.json();
                // Success
                setShowQRModal(false); // Close QR modal if open
                setShowSuccessModal(true); // Show Success Modal
            } else {
                console.error("Booking creation failed");
                setQrError("Failed to create booking. Please try again.");
            }

        } catch (error: any) {
            console.error("Booking failed", error);
            if (error instanceof NetworkError) {
                setQrError(error.isTimeout
                    ? "Slow network detected. Your booking request timed out. Please try again."
                    : "Network error. Check your connection and try again.");
            } else {
                setQrError("An error occurred. Please try again.");
            }
        } finally {
            setIsProcessing(false);
            bookingInProgress.current = false;
        }
    };

    const handleQRSubmit = async () => {
        if (!transactionId.trim()) {
            setQrError("Please enter the Transaction ID/UTR Reference.");
            return;
        }
        setQrError("");
        await processBooking(transactionId);
        // Modal will stay open showing processing state via isProcessing logic if needed, 
        // or we can close it. Since we redirect, keeping it open or showing loader in button is fine.
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D35400]"></div>
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="min-h-screen bg-[#F5F6F8] pb-12 relative">
            {/* Network Error Banner */}
            {networkError && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3">
                    <div className="max-w-6xl mx-auto flex items-center gap-3">
                        <WifiOff size={18} className="text-red-500 shrink-0" />
                        <p className="text-red-700 text-sm font-medium flex-1">{networkError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-red-600 text-sm font-bold hover:underline shrink-0"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
            {/* Professional Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#2C0E0F]">
                        <ShieldCheck className="text-green-600" size={28} />
                        <h1 className="text-xl font-serif font-bold tracking-wide">Secure Checkout</h1>
                    </div>
                    <div className="text-sm text-gray-500 hidden md:block">
                        Need Help? <span className="font-semibold text-[#D35400]">Call Support</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-8">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center text-gray-500 hover:text-[#D35400] mb-6 font-medium transition-colors text-sm"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Services
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Summary & Payment */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Client Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-lg font-bold text-[#2C0E0F] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#D35400] font-bold text-sm">1</span>
                                Client Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                                <div>
                                    <p className="text-gray-400 mb-1 text-xs uppercase tracking-wider">Name</p>
                                    <p className="font-semibold text-gray-800 text-base">{client.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1 text-xs uppercase tracking-wider">Email</p>
                                    <p className="font-semibold text-gray-800 text-base">{client.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1 text-xs uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-gray-800 text-base">{client.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1 text-xs uppercase tracking-wider">Address</p>
                                    <p className="font-semibold text-gray-800 text-base">{client.address || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-lg font-bold text-[#2C0E0F] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#D35400] font-bold text-sm">2</span>
                                Select Payment Method
                            </h2>

                            <div className="space-y-4">
                                {/* QR Code Option - NOW FIRST
                                <label
                                    className={`relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${paymentMethod === 'qr'
                                        ? 'border-[#D35400] bg-orange-50/30'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setPaymentMethod('qr')}
                                >
                                    <div className="flex-shrink-0 mr-5">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'qr' ? 'border-[#D35400]' : 'border-gray-300 group-hover:border-gray-400'
                                            }`}>
                                            {paymentMethod === 'qr' && <div className="w-3 h-3 rounded-full bg-[#D35400]" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-bold text-gray-800 block mb-1 text-lg">Scan QR Code</span>
                                        <p className="text-sm text-gray-500">Manual payment via verified Merchant QR</p>
                                    </div>
                                    <div className="hidden md:block opacity-80 pl-4 border-l border-gray-200 ml-4">
                                        <ScanLine className="text-[#D35400]" size={28} />
                                    </div>
                                </label>
                                */}

                                {/* Razorpay Option - NOW SECOND */}
                                <label
                                    className={`relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${paymentMethod === 'razorpay'
                                        ? 'border-[#3399CC] bg-blue-50/30'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setPaymentMethod('razorpay')}
                                >
                                    <div className="flex-shrink-0 mr-5">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'razorpay' ? 'border-[#3399CC]' : 'border-gray-300 group-hover:border-gray-400'
                                            }`}>
                                            {paymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-[#3399CC]" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-gray-800 text-lg">Razorpay</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Credit/Debit Card, UPI, NetBanking</p>
                                    </div>
                                    <div className="hidden md:block opacity-80 pl-4 border-l border-gray-200 ml-4">
                                        <div className="flex gap-3">
                                            <CreditCard size={24} className="text-gray-400" />
                                            <ShieldCheck size={24} className="text-green-600" />
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D35400] to-[#F1C40F]"></div>

                            <div>
                                <h2 className="text-lg font-bold text-[#2C0E0F] mb-6 flex items-center gap-2">
                                    <ShieldCheck className="text-green-600" size={20} />
                                    Booking Summary
                                </h2>

                                <div className="space-y-5 mb-8">
                                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Service</span>
                                        <span className="font-bold text-right text-gray-800 text-sm">{serviceName || "Loading..."}</span>
                                    </div>
                                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Location</span>
                                        <span className="font-bold text-right text-gray-800 text-sm flex items-center justify-end gap-1">
                                            <MapPin size={14} className="text-[#D35400]" />
                                            {locationName || "Loading..."}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                                        <span className="text-gray-500 text-sm">Package</span>
                                        <span className="font-bold text-right text-[#D35400] text-sm">{packageName}</span>
                                    </div>
                                </div>

                                {/* Coupon Section */}
                                <div className="mb-6">
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Have a coupon?"
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D35400] outline-none uppercase"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode || verifying}
                                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {verifying ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-green-700 font-bold text-sm flex items-center gap-1">
                                                    <Tag size={14} /> {appliedCoupon.code}
                                                </p>
                                                <p className="text-green-600 text-xs">
                                                    Saved ₹{discountAmount.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={removeCoupon}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-red-500 text-xs mt-1.5">{couponError}</p>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-8">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Base Price</span>
                                        <span className="font-medium text-gray-800">₹{basePrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-green-600">
                                            <span>Discount</span>
                                            <span className="font-medium">-₹{discountAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    {gstAmount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-[#D35400]">
                                            <span>GST (18%)</span>
                                            <span className="font-medium">+₹{gstAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                                        <span className="font-bold text-gray-800">Total</span>
                                        <span className="font-bold text-2xl text-[#2C0E0F]">
                                            ₹{totalAmount.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-[#2C0E0F] text-[#DAA520] font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                                >
                                    {isProcessing && paymentMethod !== 'qr' ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'razorpay' ? 'Make Payment' : 'Pay via QR Code'}
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-4 text-gray-500 opacity-90 mt-4">
                                    <div className="text-[10px] font-bold flex items-center justify-center gap-3 tracking-widest">
                                        <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-gray-600" /> SSL SECURE</span>
                                        <span className="text-gray-300">•</span>
                                        <span>256-BIT ENCRYPTION</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Payment Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-[#e6d0a8] animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="bg-[#2C0E0F] p-4 flex items-center justify-between text-[#DAA520]">
                            <h3 className="font-bold font-serif text-lg flex items-center gap-2">
                                <ScanLine size={20} />
                                Scan & Pay
                            </h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="hover:bg-white/10 p-1.5 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-[#D35400] mb-6 flex flex-col items-center justify-center min-h-[200px]">
                                {!imageError ? (
                                    <>
                                        <div className="relative w-48 h-48 mb-2">
                                            <Image
                                                src={`/QR/${totalAmount}.jpeg`}
                                                alt={`QR Code for ₹${totalAmount}`}
                                                fill
                                                className="object-contain"
                                                onError={() => setImageError(true)}
                                                unoptimized
                                            />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 mt-2">
                                            UPI ID: <span className="select-all">43939238111@sbi</span>
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="text-gray-500 text-sm mb-2">Scan & Pay to UPI ID</p>
                                        <p className="text-2xl font-bold text-[#2C0E0F] select-all break-all">
                                            43939238111@sbi
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-gray-500 text-sm mb-1">Total Amount to Pay</p>
                                <p className="text-3xl font-bold text-[#D35400]">₹{totalAmount.toLocaleString('en-IN')}</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleQRSubmit(); }} className="w-full space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Enter Transaction ID / UTR
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="e.g. 123456789012"
                                        className={`w-full p-3 bg-gray-50 border ${qrError ? 'border-red-500' : 'border-gray-200'} rounded-lg outline-none focus:border-[#D35400] focus:ring-1 focus:ring-[#D35400] text-sm font-medium`}
                                    />
                                    {qrError ? (
                                        <p className="text-red-500 text-xs mt-1">{qrError}</p>
                                    ) : (
                                        <p className="text-gray-400 text-xs mt-1">
                                            Found in your payment app after successful transfer.
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full py-3.5 bg-[#D35400] text-white font-bold rounded-xl shadow-lg hover:bg-[#b04600] transition-transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Verifying...
                                        </>
                                    ) : (
                                        <>Submit Payment Reference</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="bg-orange-50 p-3 text-center border-t border-orange-100">
                            <p className="text-xs text-[#D35400] font-medium flex items-center justify-center gap-1">
                                <ShieldCheck size={12} />
                                Verified Merchant: Manima Spiritual Services
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal for Razorpay */}
            {showErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="bg-red-50 p-4 flex items-center justify-between text-red-700">
                            <h3 className="font-bold flex items-center gap-2">
                                <ShieldCheck size={20} className="text-red-600" />
                                Payment Error
                            </h3>
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="hover:bg-red-100 p-1.5 rounded-full transition text-red-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={32} className="text-red-600" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h4>
                            <p className="text-gray-600 text-sm mb-6">
                                Facing issue from Razorpay site, Try another payment or contact to Support Team.
                            </p>

                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                            >
                                Close & Try Other Method
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 border border-green-100">
                        {/* Header */}
                        <div className="bg-green-50 p-4 flex items-center justify-between text-green-800">
                            <h3 className="font-bold flex items-center gap-2 font-serif">
                                <ShieldCheck size={20} className="text-green-600" />
                                Booking Placed
                            </h3>
                            {/* Optional Close Button (though user must go to dashboard) */}
                        </div>

                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle2 size={40} className="text-green-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-[#2C0E0F] mb-3 font-serif">Order Under Process</h4>
                            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                                Your booking has been submitted. After verification of the payment, it will be confirmed.
                            </p>

                            <button
                                onClick={() => router.push('/client/dashboard')}
                                className="w-full py-3.5 bg-[#2C0E0F] text-[#DAA520] font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D35400]"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
