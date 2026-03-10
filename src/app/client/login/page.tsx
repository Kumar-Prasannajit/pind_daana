
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import PujaModal from "@/components/PujaModal";

export default function ClientLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/client/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === "ACCOUNT_NOT_VERIFIED") {
                    throw new Error(`Your account is not verified. <a href="/client/verify-otp?email=${data.email}" class="underline font-bold">Verify Now</a>`);
                }
                throw new Error(data.error || "Login failed");
            }

            // Redirect to destination or client dashboard
            window.dispatchEvent(new Event("auth-change"));

            const redirectUrl = searchParams.get("redirect") || "/client/dashboard";
            router.push(redirectUrl);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFAF0] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#DAA520] blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#D35400] blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#DAA520]/20 p-8">

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 mb-4 relative">
                            {/* Placeholder for Diya/Logo - using the main logo for now */}
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
                        <p className="text-[#8B4513] text-sm font-medium">Sign in to manage your bookings</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <span dangerouslySetInnerHTML={{ __html: error }}></span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#5D4037] mb-2 uppercase tracking-wider text-xs">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-[#FDFAF0] border border-[#E0E0E0] focus:border-[#DAA520] focus:ring-1 focus:ring-[#DAA520] outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#5D4037] mb-2 uppercase tracking-wider text-xs">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-[#FDFAF0] border border-[#E0E0E0] focus:border-[#DAA520] focus:ring-1 focus:ring-[#DAA520] outline-none transition-all placeholder:text-gray-400 text-gray-800 pr-10"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D35400] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#D35400] to-[#E67E22] text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
                        </button>
                    </form>

                    {/* Footer / Links */}
                    <div className="mt-8 text-center space-y-2">
                        <Link href="/client/forgot-password" className="text-sm text-gray-600 hover:text-[#D35400] font-medium transition-colors mb-4 block">
                            Forgot Password?
                        </Link>
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
                </div>

                {/* Cultural Footer Text */}
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
