"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    // Handle input change
    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pastedData.every(char => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            pastedData.forEach((val, i) => {
                if (i < 6) newOtp[i] = val;
            });
            setOtp(newOtp);
            // Focus the last filled input or the first empty one
            const focusIndex = Math.min(pastedData.length, 5);
            const inputs = document.querySelectorAll('input[name^="otp-"]');
            if (inputs[focusIndex]) (inputs[focusIndex] as HTMLInputElement).focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/client/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    otp: otpValue
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Verification failed");
            }

            // Success - Redirect to Dashboard
            router.push("/client/dashboard");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setResendMessage("");
        setError("");

        try {
            const res = await fetch("/api/client/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to resend OTP");
            }

            setResendMessage("OTP resent successfully!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setResendLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Invalid Request. No email provided.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="text-3xl font-heading text-gray-900">
                        Verify your email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We have sent a 6-digit code to <span className="font-semibold text-gray-800">{email}</span>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleVerify}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {resendMessage && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                                <p className="text-sm text-green-700 flex items-center gap-2">
                                    <CheckCircle2 size={16} /> {resendMessage}
                                </p>
                            </div>
                        )}

                        <div className="justify-center">
                            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                Enter 6-digit OTP
                            </label>
                            <div className="flex justify-between gap-2">
                                {otp.map((data, index) => (
                                    <input
                                        className="w-12 h-12 border-2 rounded-lg text-center text-xl font-bold text-gray-800 focus:border-manima-gold focus:ring-manima-gold focus:outline-none transition-all"
                                        type="text"
                                        name={`otp-${index}`}
                                        key={index}
                                        value={data}
                                        maxLength={1}
                                        onChange={(e) => handleChange(e.target, index)}
                                        onFocus={(e) => e.target.select()}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-manima-red to-red-600 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-manima-red disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Verify OTP <ArrowRight size={16} />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Didn't receive the code?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleResendOtp}
                                disabled={resendLoading}
                                className="flex items-center gap-2 text-manima-red hover:text-red-700 font-medium text-sm disabled:opacity-50"
                            >
                                {resendLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw size={14} />}
                                Resend OTP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-manima-red" /></div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
