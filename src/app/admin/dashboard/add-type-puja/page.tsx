"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AddTypePujaPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        significance: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("significance", formData.significance);
            if (selectedFile) {
                formDataToSend.append("image", selectedFile);
            }

            const response = await fetch("/api/type-pujas", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create type puja");
            }

            toast.success("Type Puja created successfully!");
            router.push("/admin/dashboard/type-pujas");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <Link
                    href="/admin/dashboard/type-pujas"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-manima-red transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Type Pujas
                </Link>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Add New Type Puja</h1>
                <p className="text-gray-500 mt-1 text-sm">Create a new type of puja to offer</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
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
                                placeholder="e.g. Navagraha Shanti"
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
                                placeholder="Describe the significance and details of this puja..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/dashboard/type-pujas")}
                            className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mr-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center min-w-[140px] px-6 py-3 bg-manima-red text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Save Puja
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
