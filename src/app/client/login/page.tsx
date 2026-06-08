"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import PujaModal from "@/components/PujaModal";

function ClientLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [refId, setRefId] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/api/client/auth/oauth-callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || "Failed to login with Google");
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/client/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || data.errors?.[0] || "Failed to send OTP");
            }

            setRefId(data.ref_id);
            setMessage(data.message);
            setStep(2);
            setResendCooldown(120); // 2 minutes cooldown
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/client/auth/verify-login-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ref_id: refId, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Invalid OTP");
            }

            window.dispatchEvent(new Event("auth-change"));

            const redirectUrl = searchParams.get("redirect") || "/";
            router.push(redirectUrl);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/client/auth/login-resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ref_id: refId }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.retry_after_seconds) {
                    setResendCooldown(data.retry_after_seconds);
                }
                throw new Error(data.message || "Failed to resend OTP");
            }

            setMessage("New OTP sent successfully");
            setResendCooldown(120);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFAF0] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#DAA520] blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#D35400] blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#DAA520]/20 p-8 relative">

                    {step === 2 && (
                        <button 
                            onClick={() => { setStep(1); setOtp(""); setError(""); setMessage(""); }}
                            className="absolute top-6 left-6 text-[#8B4513]/60 hover:text-[#D35400] transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 mb-4 relative">
                            <Image
                                src="/assets/logo.png"
                                alt="Manima Logo"
                                width={64}
                                height={64}
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <h1 className="font-serif text-3xl text-[#D35400] mb-2 font-bold tracking-wide">Welcome</h1>
                        <p className="text-[#8B4513] text-sm font-medium">
                            {step === 1 ? "Sign in to manage your bookings" : "Enter the OTP sent to your email & WhatsApp"}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <span dangerouslySetInnerHTML={{ __html: error }}></span>
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <span>{message}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#5D4037] mb-2 uppercase tracking-wider text-xs">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-[#FDFAF0] border border-[#E0E0E0] focus:border-[#DAA520] focus:ring-1 focus:ring-[#DAA520] outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#D35400] to-[#E67E22] text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#5D4037] mb-2 uppercase tracking-wider text-xs">6-Digit OTP</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                    className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] rounded-lg bg-[#FDFAF0] border border-[#E0E0E0] focus:border-[#DAA520] focus:ring-1 focus:ring-[#DAA520] outline-none transition-all placeholder:text-gray-400 text-gray-800 font-mono"
                                    placeholder="------"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-gradient-to-r from-[#D35400] to-[#E67E22] text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Sign In"}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0 || loading}
                                    className="text-sm font-medium text-[#D35400] hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 1 && (
                        <>
                            <div className="mt-6 flex items-center justify-center space-x-4">
                                <div className="h-[1px] bg-gray-300 w-full"></div>
                                <span className="text-gray-500 text-sm font-medium">OR</span>
                                <div className="h-[1px] bg-gray-300 w-full"></div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="mt-6 mb-2 w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-lg shadow-sm hover:shadow hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                        </>
                    )}

                    {step === 1 && (
                        <div className="mt-8 text-center space-y-2">
                            <p className="text-gray-500 text-sm">
                                Don't have an account?{" "}
                                <Link href="/client/signup" className="text-[#D35400] font-semibold hover:underline">
                                    Sign up
                                </Link>
                            </p>
                            <p className="text-gray-500 text-sm pt-2">
                                Need help?{" "}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-[#D35400] font-semibold hover:underline"
                                >
                                    Contact Support
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-[#8B4513]/60 text-xs mt-6 font-serif italic">
                    "Serve your ancestors with devotion"
                </p>
            </div>

            <PujaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default function ClientLogin() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FDFAF0]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D35400]"></div>
            </div>
        }>
            <ClientLoginContent />
        </Suspense>
    );
}
