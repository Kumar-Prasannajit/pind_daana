"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Plus, Save, Tag, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Service {
    _id: string;
    name: string;
}

interface Pricing {
    name: string;
    price: string | number;
    features: string[];
}

interface ServicePricing {
    serviceId: string;
    serviceName: string;
    pricing: Pricing[];
}

export default function EditLocationPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
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
        const fetchData = async () => {
            try {
                const [servicesRes, locationRes] = await Promise.all([
                    fetch("/api/services"),
                    fetch("/api/locations"),
                ]);

                const servicesData = await servicesRes.json();
                const locationData = await locationRes.json();
                const location = Array.isArray(locationData) ? locationData.find((item: any) => item._id === params.id) : null;

                if (Array.isArray(servicesData)) {
                    setServices(servicesData);
                }

                if (!location) {
                    setError("Location not found");
                    setIsLoading(false);
                    return;
                }

                setFormData({
                    name: location.name || "",
                    description: location.description || "",
                    imageUrl: location.imageUrl || "",
                    city: location.city || "",
                    state: location.state || "",
                    servicePackages: (location.services || []).map((serviceEntry: any) => {
                        const serviceId = typeof serviceEntry.service === "string" ? serviceEntry.service : serviceEntry.service?._id;
                        const serviceName = servicesData.find((service: any) => service._id === serviceId)?.name || "Unknown Service";

                        return {
                            serviceId,
                            serviceName,
                            pricing: (serviceEntry.pricing || []).map((pkg: any) => ({
                                name: pkg.name,
                                price: pkg.price,
                                features: pkg.features || [],
                            })),
                        };
                    }),
                });

                if (location.imageUrl) {
                    setImagePreview(location.imageUrl);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load location details");
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) fetchData();
    }, [params.id]);

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
                return {
                    ...prev,
                    servicePackages: prev.servicePackages.filter((sp) => sp.serviceId !== service._id),
                };
            }

            return {
                ...prev,
                servicePackages: [
                    ...prev.servicePackages,
                    { serviceId: service._id, serviceName: service.name, pricing: [{ name: "", price: "", features: [] }] },
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("id", params.id);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("city", formData.city);
            formDataToSend.append("state", formData.state);
            formDataToSend.append("services", JSON.stringify(formData.servicePackages.map((sp) => ({
                service: sp.serviceId,
                pricing: sp.pricing.map((pkg) => ({ ...pkg, price: Number(pkg.price) })),
            }))));

            if (selectedFile) {
                formDataToSend.append("image", selectedFile);
            } else if (formData.imageUrl) {
                formDataToSend.append("imageUrl", formData.imageUrl);
            }

            const response = await fetch("/api/locations", {
                method: "PATCH",
                body: formDataToSend,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update location");

            router.push("/admin/dashboard/locations");
            router.refresh();
        } catch (err: any) {
            console.error("Error updating location:", err);
            setError(err.message || "Failed to update location");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="max-w-5xl mx-auto p-6">Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-6">
                <Link href="/admin/dashboard/locations" className="flex items-center gap-2 text-gray-500 hover:text-manima-red transition-colors mb-2 text-sm font-medium">
                    <ArrowLeft size={16} /> Back to All Locations
                </Link>
                <h1 className="text-2xl font-heading font-bold text-gray-900 tracking-tight">Edit Location</h1>
                <p className="text-gray-500 mt-1 text-sm">Update location details and pricing</p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </div>
            )}

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
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setSelectedFile(null);
                                                    setFormData((prev) => ({ ...prev, imageUrl: "" }));
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white text-gray-700 rounded-full transition-colors"
                                            >
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
                        ) : (
                            formData.servicePackages.map((sp, serviceIndex) => (
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
                                                    <input
                                                        type="text"
                                                        placeholder="Add feature and press Enter"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleFeatureAdd(serviceIndex, pricingIndex, e.currentTarget.value);
                                                                e.currentTarget.value = "";
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm"
                                                    />
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
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2">Available Services</h3>
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
                    </div>

                    <div className="sticky top-24">
                        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-manima-red to-red-600 text-white px-6 py-4 rounded-xl">
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isSubmitting ? "Updating Location..." : "Update Location"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
