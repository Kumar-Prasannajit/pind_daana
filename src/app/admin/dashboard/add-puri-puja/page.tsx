"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Upload, X, Plus, Flag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AddPuriPujaPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        significance: "",
    });
    const [pricing, setPricing] = useState<{ name: string; amount: string }[]>([]);
    const [pricingInputName, setPricingInputName] = useState("");
    const [pricingInputAmount, setPricingInputAmount] = useState("");
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addPricing = () => {
        const trimmedName = pricingInputName.trim();
        const trimmedAmount = pricingInputAmount.trim();
        
        if (!trimmedName || !trimmedAmount) return;
        
        setPricing((prev) => [...prev, { name: trimmedName, amount: trimmedAmount }]);
        setPricingInputName("");
        setPricingInputAmount("");
    };

    const removePricing = (index: number) => {
        setPricing((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePricingKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addPricing();
        }
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
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("significance", formData.significance);
            formDataToSend.append("pricing", JSON.stringify(pricing));
            formDataToSend.append("milestones", JSON.stringify(milestones));
            if (selectedFile) {
                formDataToSend.append("image", selectedFile);
            }

            const response = await fetch("/api/puri-pujas", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create puri puja");
            }

            toast.success("Puri Puja created successfully!");
            router.push("/admin/dashboard/puri-pujas");
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
                    href="/admin/dashboard/puri-pujas"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-manima-red transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Puri Pujas
                </Link>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Add New Puri Puja</h1>
                <p className="text-gray-500 mt-1 text-sm">Create a new Puri puja to offer</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Image Upload */}
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
                                                htmlFor="puri-image-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-manima-red hover:text-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-manima-red"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="puri-image-upload"
                                                    name="puri-image-upload"
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
                                placeholder="e.g. Jagannath Mahapuja"
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
                                placeholder="Describe the significance and details of this Puri puja..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Pricing */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Plus size={15} className="text-manima-red" />
                                Pricing Options
                            </label>

                            {pricing.length > 0 && (
                                <div className="flex flex-col gap-2 mb-3">
                                    {pricing.map((p, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{p.name}</span>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-gray-600">₹{p.amount}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removePricing(i)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pricingInputName}
                                    onChange={(e) => setPricingInputName(e.target.value)}
                                    onKeyDown={handlePricingKeyDown}
                                    placeholder="e.g. One Time, Monthly"
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all text-sm"
                                />
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium select-none">₹</span>
                                    <input
                                        type="number"
                                        value={pricingInputAmount}
                                        onChange={(e) => setPricingInputAmount(e.target.value)}
                                        onKeyDown={handlePricingKeyDown}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addPricing}
                                    disabled={!pricingInputName.trim() || !pricingInputAmount.trim()}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-manima-red border border-gray-200 hover:border-red-200 text-gray-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} />
                                    Add Price
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Add different pricing packages for this puja.</p>
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
                                    placeholder="e.g. Puja Started"
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
                            onClick={() => router.push("/admin/dashboard/puri-pujas")}
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
