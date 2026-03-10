"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditTypePujaPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        significance: "",
    });

    useEffect(() => {
        const fetchTypePuja = async () => {
            try {
                const response = await fetch(`/api/type-pujas/${resolvedParams.id}`);
                if (!response.ok) throw new Error("Failed to fetch type puja details");

                const data = await response.json();
                setFormData({
                    name: data.name || "",
                    significance: data.significance || "",
                });
            } catch (error) {
                console.error("Error fetching type puja:", error);
                toast.error("Could not load type puja details");
                router.push("/admin/dashboard/type-pujas");
            } finally {
                setIsLoading(false);
            }
        };

        if (resolvedParams.id) {
            fetchTypePuja();
        }
    }, [resolvedParams.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch("/api/type-pujas", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, id: resolvedParams.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update type puja");
            }

            toast.success("Type Puja updated successfully!");
            router.push("/admin/dashboard/type-pujas");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this type puja? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/type-pujas/${resolvedParams.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete type puja");
            }

            toast.success("Type Puja deleted successfully!");
            router.push("/admin/dashboard/type-pujas");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-manima-red" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <Link
                        href="/admin/dashboard/type-pujas"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-manima-red transition-colors mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Type Pujas
                    </Link>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">Edit Type Puja</h1>
                    <p className="text-gray-500 mt-1 text-sm">Update type puja details</p>
                </div>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting || isSaving}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    Delete Puja
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Puja Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="significance" className="block text-sm font-medium text-gray-700 mb-1">
                                Significance <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="significance"
                                name="significance"
                                value={formData.significance}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/dashboard/type-pujas")}
                            className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mr-4"
                            disabled={isSaving || isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isDeleting}
                            className="inline-flex items-center justify-center min-w-[140px] px-6 py-3 bg-manima-red text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSaving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Update Puja
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
