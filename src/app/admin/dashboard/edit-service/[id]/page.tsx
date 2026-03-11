"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditServicePage() {
    const router = useRouter();
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        details: "",
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch("/api/services");
                const data = await response.json();
                if (Array.isArray(data)) {
                    const service = data.find((s: any) => s._id === params.id);
                    if (service) {
                        setFormData({
                            name: service.name,
                            details: service.details,
                        });
                    } else {
                        alert("Service not found");
                        router.push("/admin/dashboard/services");
                    }
                }
            } catch (error) {
                console.error("Error fetching service details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchService();
        }
    }, [params.id, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/services", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: params.id,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update service");
            }

            router.push("/admin/dashboard/services");
            router.refresh();
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to update Service. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-6 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                    </div>
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/admin/dashboard/services" className="flex items-center gap-2 text-gray-500 hover:text-manima-red transition-colors mb-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to All Services
                    </Link>
                    <h1 className="text-2xl font-heading font-bold text-gray-900 tracking-tight">Edit Service</h1>
                    <p className="text-gray-500 mt-1 text-sm">Update service details</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-colors"
                            placeholder="e.g. Pinda Daan"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Details</label>
                        <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-colors"
                            placeholder="Detailed description of the service..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-gradient-to-r from-manima-red to-red-700 text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isSubmitting ? "Updating..." : "Update Service"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
