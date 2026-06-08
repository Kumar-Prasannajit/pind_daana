"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, Trash2, Upload, X, Plus, Flag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function EditTypePujaPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const resolvedParams = params || { id: "" };
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        significance: "",
        imageUrl: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [milestones, setMilestones] = useState<string[]>([]);
    const [milestoneInput, setMilestoneInput] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchTypePuja = async () => {
            try {
                const response = await fetch(`/api/type-pujas/${resolvedParams.id}`);
                if (!response.ok) throw new Error("Failed to fetch type puja details");

                const data = await response.json();
                setFormData({
                    name: data.name || "",
                    significance: data.significance || "",
                    imageUrl: data.imageUrl || "",
                });
                if (data.imageUrl) {
                    setImagePreview(data.imageUrl);
                }
                setMilestones(Array.isArray(data.milestones) ? data.milestones : []);
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

    const addMilestone = () => {
        const trimmed = milestoneInput.trim();
        if (!trimmed) return;
        if (milestones.includes(trimmed)) {
            setMilestoneInput("");
            return;
        }
        setMilestones((prev) => [...prev, trimmed]);
        setMilestoneInput("");
    };

    const removeMilestone = (index: number) => {
        setMilestones((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMilestoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addMilestone();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("id", resolvedParams.id);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("significance", formData.significance);
            formDataToSend.append("milestones", JSON.stringify(milestones));

            if (selectedFile) {
                formDataToSend.append("image", selectedFile);
            } else if (formData.imageUrl) {
                formDataToSend.append("imageUrl", formData.imageUrl);
            }

            const response = await fetch("/api/type-pujas", {
                method: "PATCH",
                body: formDataToSend,
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
                        {/* Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Puja Image
                            </label>
                            <div className="mt-1 flex justify-center px-4 pt-3 pb-4 border-2 border-gray-300 border-dashed rounded-xl hover:border-manima-red transition-colors relative">
                                {imagePreview ? (
                                    <div className="relative w-full max-w-[300px] aspect-video rounded-lg overflow-hidden mx-auto">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setSelectedFile(null);
                                                setFormData(prev => ({ ...prev, imageUrl: "" }));
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-gray-700 rounded-full transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label
                                                htmlFor="image-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-manima-red hover:text-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-manima-red"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="image-upload"
                                                    name="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Puja Name */}
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

                        {/* Significance */}
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

                        {/* Milestones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Flag size={15} className="text-manima-red" />
                                Milestones / Checkpoints
                            </label>

                            {milestones.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {milestones.map((m, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-full px-3 py-1"
                                        >
                                            <span className="w-4 h-4 flex items-center justify-center bg-manima-red text-white text-[10px] font-bold rounded-full shrink-0">
                                                {i + 1}
                                            </span>
                                            {m}
                                            <button
                                                type="button"
                                                onClick={() => removeMilestone(i)}
                                                className="ml-0.5 text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={milestoneInput}
                                    onChange={(e) => setMilestoneInput(e.target.value)}
                                    onKeyDown={handleMilestoneKeyDown}
                                    placeholder="e.g. Puja Completed"
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={addMilestone}
                                    disabled={!milestoneInput.trim()}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-manima-red border border-gray-200 hover:border-red-200 text-gray-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Press Enter or click Add to add a milestone checkpoint.</p>
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
