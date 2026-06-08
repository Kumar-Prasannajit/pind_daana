"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, MapPin, Tag, CheckCircle2, Upload, X, Flag } from "lucide-react";
import Image from "next/image";

interface Service {
    _id: string;
    name: string;
}

interface Pricing {
    name: string;
    price: string;
    features: string[];
}

interface ServicePricing {
    serviceId: string;
    serviceName: string;
    pricing: Pricing[];
    milestones: string[];
    milestoneInput?: string;
}

export default function AddLocation() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingServices, setFetchingServices] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrl: "",
        city: "",
        state: "",
        servicePackages: [] as ServicePricing[],
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/services");
                if (!res.ok) throw new Error("Failed to fetch services");
                const data = await res.json();
                setServices(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setFetchingServices(false);
            }
        };
        fetchServices();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleServiceToggle = (service: Service) => {
        setFormData((prev) => {
            const exists = prev.servicePackages.find((sp) => sp.serviceId === service._id);
            if (exists) {
                return { ...prev, servicePackages: prev.servicePackages.filter((sp) => sp.serviceId !== service._id) };
            }

            return {
                ...prev,
                servicePackages: [
                    ...prev.servicePackages,
                    { 
                        serviceId: service._id, 
                        serviceName: service.name, 
                        pricing: [{ name: "", price: "", features: [] }],
                        milestones: [],
                        milestoneInput: "",
                    },
                ],
            };
        });
    };

    const handleAddPricing = (serviceIndex: number) => {
        const next = [...formData.servicePackages];
        if (next[serviceIndex].pricing.length >= 3) return;
        next[serviceIndex].pricing.push({ name: "", price: "", features: [] });
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handlePricingChange = (serviceIndex: number, pricingIndex: number, field: "name" | "price", value: string) => {
        const next = [...formData.servicePackages];
        next[serviceIndex].pricing[pricingIndex][field] = value;
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handleFeatureAdd = (serviceIndex: number, pricingIndex: number, feature: string) => {
        if (!feature.trim()) return;
        const next = [...formData.servicePackages];
        next[serviceIndex].pricing[pricingIndex].features.push(feature.trim());
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handleFeatureRemove = (serviceIndex: number, pricingIndex: number, featureIndex: number) => {
        const next = [...formData.servicePackages];
        next[serviceIndex].pricing[pricingIndex].features = next[serviceIndex].pricing[pricingIndex].features.filter((_, index) => index !== featureIndex);
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handleRemovePricing = (serviceIndex: number, pricingIndex: number) => {
        const next = [...formData.servicePackages];
        next[serviceIndex].pricing = next[serviceIndex].pricing.filter((_, index) => index !== pricingIndex);
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handleMilestoneInputChange = (serviceIndex: number, value: string) => {
        const next = [...formData.servicePackages];
        next[serviceIndex].milestoneInput = value;
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handleAddMilestone = (serviceIndex: number) => {
        const next = [...formData.servicePackages];
        const trimmed = (next[serviceIndex].milestoneInput || "").trim();
        if (!trimmed) return;
        
        if (!next[serviceIndex].milestones) {
            next[serviceIndex].milestones = [];
        }
        if (!next[serviceIndex].milestones.includes(trimmed)) {
            next[serviceIndex].milestones.push(trimmed);
        }
        next[serviceIndex].milestoneInput = "";
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handleRemoveMilestone = (serviceIndex: number, milestoneIndex: number) => {
        const next = [...formData.servicePackages];
        next[serviceIndex].milestones = next[serviceIndex].milestones.filter((_, idx) => idx !== milestoneIndex);
        setFormData((prev) => ({ ...prev, servicePackages: next }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("city", formData.city);
            formDataToSend.append("state", formData.state);
            formDataToSend.append("services", JSON.stringify(formData.servicePackages.map((sp) => ({
                service: sp.serviceId,
                pricing: sp.pricing.map((pkg) => ({ ...pkg, price: Number(pkg.price) })),
                milestones: sp.milestones || [],
            }))));

            if (selectedFile) formDataToSend.append("image", selectedFile);
            else if (formData.imageUrl) formDataToSend.append("imageUrl", formData.imageUrl);

            const response = await fetch("/api/locations", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to create location");

            setSuccess(true);
            setFormData({
                name: "",
                description: "",
                imageUrl: "",
                city: "",
                state: "",
                servicePackages: [],
            });
            setImagePreview(null);
            setSelectedFile(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-heading text-gray-800 mb-8 flex items-center gap-3">
                <MapPin className="text-manima-red" />
                Add New Location
            </h2>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm">{error}</div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 shadow-sm">Location created successfully!</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Location Image</label>
                                <div className="flex justify-center px-4 pt-3 pb-4 border-2 border-gray-300 border-dashed rounded-xl hover:border-manima-red transition-colors bg-gray-50">
                                    {imagePreview ? (
                                        <div className="relative w-full max-w-[360px] aspect-video rounded-lg overflow-hidden mx-auto">
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                            <button type="button" onClick={() => { setImagePreview(null); setSelectedFile(null); setFormData((prev) => ({ ...prev, imageUrl: "" })); }} className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white text-gray-700 rounded-full transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                            <label htmlFor="location-image-upload" className="relative cursor-pointer rounded-md font-medium text-manima-red hover:text-red-700">
                                                <span>Upload a location image</span>
                                                <input id="location-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" placeholder="Location Name" />
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg resize-none" placeholder="Brief description" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" placeholder="City" />
                                <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" placeholder="State" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-heading text-gray-700 border-b pb-2 flex items-center justify-between">
                            <span>Service Pricing Configuration</span>
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{formData.servicePackages.length} Services Selected</span>
                        </h3>

                        {formData.servicePackages.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Tag className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No services selected.</p>
                            </div>
                        ) : formData.servicePackages.map((sp, serviceIndex) => (
                            <div key={sp.serviceId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6 border-b border-dashed pb-3">
                                    <h4 className="text-lg font-bold text-gray-800">{sp.serviceName}</h4>
                                    <button type="button" onClick={() => handleAddPricing(serviceIndex)} disabled={sp.pricing.length >= 3} className="text-manima-red border border-manima-red px-3 py-1.5 rounded-full text-xs font-semibold">
                                        <Plus size={14} className="inline mr-1" />ADD PACKAGE
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {sp.pricing.map((pkg, pricingIndex) => (
                                        <div key={pricingIndex} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <input type="text" value={pkg.name} onChange={(e) => handlePricingChange(serviceIndex, pricingIndex, "name", e.target.value)} placeholder="Package Name" className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm" />
                                            <input type="number" value={pkg.price} onChange={(e) => handlePricingChange(serviceIndex, pricingIndex, "price", e.target.value)} placeholder="Price" className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm" />
                                            <div className="flex-[2]">
                                                <input type="text" placeholder="Add feature and press Enter" onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleFeatureAdd(serviceIndex, pricingIndex, e.currentTarget.value);
                                                        e.currentTarget.value = "";
                                                    }
                                                }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm" />
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {pkg.features.map((feature, featureIndex) => (
                                                        <span key={featureIndex} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs text-gray-700">
                                                            {feature}
                                                            <button type="button" onClick={() => handleFeatureRemove(serviceIndex, pricingIndex, featureIndex)} className="ml-1 text-gray-400 hover:text-red-500">&times;</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => handleRemovePricing(serviceIndex, pricingIndex)} className="p-2 text-gray-400 hover:text-red-500">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Milestones section */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Flag size={15} className="text-manima-red" />
                                        Milestones / Checkpoints
                                    </label>

                                    {sp.milestones && sp.milestones.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {sp.milestones.map((m, i) => (
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
                                                        onClick={() => handleRemoveMilestone(serviceIndex, i)}
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
                                            value={sp.milestoneInput || ""}
                                            onChange={(e) => handleMilestoneInputChange(serviceIndex, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddMilestone(serviceIndex);
                                                }
                                            }}
                                            placeholder="e.g. Ritual Completed"
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddMilestone(serviceIndex)}
                                            disabled={!(sp.milestoneInput || "").trim()}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-manima-red border border-gray-200 hover:border-red-200 text-gray-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={16} />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2">Available Services</h3>
                        {fetchingServices ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                                <Loader2 size={24} className="animate-spin text-manima-gold" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {services.map((service) => {
                                    const isSelected = formData.servicePackages.some((sp) => sp.serviceId === service._id);
                                    return (
                                        <label key={service._id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "bg-red-50 border-manima-red/30 shadow-sm" : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-manima-red border-manima-red text-white" : "border-gray-300 bg-white"}`}>
                                                {isSelected && <CheckCircle2 size={14} />}
                                                <input type="checkbox" checked={isSelected} onChange={() => handleServiceToggle(service)} className="hidden" />
                                            </div>
                                            <span className={`block text-sm font-medium ${isSelected ? "text-manima-red" : "text-gray-700"}`}>{service.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="sticky top-24">
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-manima-red to-red-600 text-white px-6 py-4 rounded-xl">
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {loading ? "Saving Location..." : "Save Location"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
