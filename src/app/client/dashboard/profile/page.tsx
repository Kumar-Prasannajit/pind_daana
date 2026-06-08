"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        whatsapp_number: "",
        address: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/client/me");
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    whatsapp_number: data.whatsapp_number || "",
                    address: data.address || "",
                });
            } else {
                router.push("/client/login");
            }
        } catch (error) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);

        try {
            const res = await fetch("/api/client/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profile.name,
                    address: profile.address,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: "Profile updated successfully!" });
                // Trigger auth update event if name changed
                window.dispatchEvent(new Event("auth-change"));
            } else {
                setMessage({ type: 'error', text: data.error || "Failed to update profile" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "An error occurred. Please try again." });
        } finally {
            setUpdating(false);
        }
    };


    if (loading) {
        return (
            <div className="max-w-4xl mx-auto pb-10 w-full animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-48 mb-8"></div>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i}>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                    <div className={`h-10 bg-gray-200 rounded w-full ${i === 4 ? 'h-24' : ''}`}></div>
                                </div>
                            ))}
                            <div className="pt-2"><div className="h-10 bg-gray-200 rounded w-full"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <h1 className="text-3xl font-heading text-[#C0392B] mb-8">My Profile</h1>

            {message && (
                <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* Profile Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EAECEE]">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#EAECEE] pb-4">
                        <User className="text-[#D35400]" />
                        <h2 className="text-xl font-semibold text-[#2C3E50]">Personal Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D35400] focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                            <input
                                type="tel"
                                value={profile.whatsapp_number}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">WhatsApp number cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D35400] focus:border-transparent outline-none min-h-[100px]"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={updating}
                                className="flex items-center justify-center gap-2 w-full bg-[#D35400] text-white py-2 px-4 rounded-md font-medium hover:bg-[#E67E22] transition-colors disabled:opacity-70"
                            >
                                {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {updating ? "Updating..." : "Update Profile"}
                            </button>
                        </div>
                    </form>
                </div>


            </div>
        </div>
    );
}
