"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, Loader2, Plus, Trash2, MapPin, Tag, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    const params = useParams();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For feedback
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        city: "",
        state: "",
        servicePackages: [] as ServicePricing[],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all available services
                const servicesRes = await fetch("/api/services");
                const servicesData = await servicesRes.json();

                // Fetch location details
                const locationRes = await fetch("/api/locations");
                const locationData = await locationRes.json();
                const location = Array.isArray(locationData) ? locationData.find((l: any) => l._id === params.id) : null;

                if (servicesRes.ok && Array.isArray(servicesData)) {
                    setServices(servicesData);
                }

                if (location) {
                    // Transform location data to match form structure
                    const formattedServicePackages = location.services.map((s: any) => {
                        // Find service name from the fetched services list or use what's in the location object if populated
                        const serviceDef = servicesData.find((sd: any) => sd._id === s.service);
                        return {
                            serviceId: s.service,
                            serviceName: serviceDef ? serviceDef.name : "Unknown Service",
                            pricing: s.pricing.map((p: any) => ({
                                name: p.name,
                                price: p.price,
                                features: p.features || []
                            }))
                        };
                    });

                    setFormData({
                        name: location.name,
                        city: location.city,
                        state: location.state,
                        servicePackages: formattedServicePackages
                    });
                } else {
                    alert("Location not found");
                    router.push("/admin/dashboard/locations");
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (service: Service) => {
        setFormData((prev) => {
            const exists = prev.servicePackages.find(sp => sp.serviceId === service._id);
            if (exists) {
                return {
                    ...prev,
                    servicePackages: prev.servicePackages.filter(sp => sp.serviceId !== service._id)
                };
            } else {
                return {
                    ...prev,
                    servicePackages: [
                        ...prev.servicePackages,
                        {
                            serviceId: service._id,
                            serviceName: service.name,
                            pricing: [{ name: "", price: "", features: [] }]
                        }
                    ]
                };
            }
        });
    };

    const handleAddPricing = (serviceIndex: number) => {
        const newServicePackages = [...formData.servicePackages];
        if (newServicePackages[serviceIndex].pricing.length >= 3) return;

        newServicePackages[serviceIndex].pricing.push({ name: "", price: "", features: [] });
        setFormData(prev => ({ ...prev, servicePackages: newServicePackages }));
    };

    const handlePricingChange = (serviceIndex: number, pricingIndex: number, field: 'name' | 'price', value: string) => {
        const newServicePackages = [...formData.servicePackages];
        // @ts-ignore
        newServicePackages[serviceIndex].pricing[pricingIndex][field] = value;
        setFormData(prev => ({ ...prev, servicePackages: newServicePackages }));
    };

    const handleFeatureAdd = (serviceIndex: number, pricingIndex: number, feature: string) => {
        if (!feature.trim()) return;
        const newServicePackages = [...formData.servicePackages];
        const pricing = newServicePackages[serviceIndex].pricing[pricingIndex];

        if (!pricing.features) pricing.features = [];
        pricing.features.push(feature.trim());

        setFormData(prev => ({ ...prev, servicePackages: newServicePackages }));
    };

    const handleFeatureRemove = (serviceIndex: number, pricingIndex: number, featureIndex: number) => {
        const newServicePackages = [...formData.servicePackages];
        const pricing = newServicePackages[serviceIndex].pricing[pricingIndex];

        pricing.features = pricing.features.filter((_, i) => i !== featureIndex);
        setFormData(prev => ({ ...prev, servicePackages: newServicePackages }));
    };

    const handleRemovePricing = (serviceIndex: number, pricingIndex: number) => {
        const newServicePackages = [...formData.servicePackages];
        newServicePackages[serviceIndex].pricing = newServicePackages[serviceIndex].pricing.filter((_, i) => i !== pricingIndex);
        setFormData(prev => ({ ...prev, servicePackages: newServicePackages }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const payload = {
                id: params.id,
                name: formData.name,
                city: formData.city,
                state: formData.state,
                services: formData.servicePackages.map(sp => ({
                    service: sp.serviceId,
                    pricing: sp.pricing.map(p => ({ ...p, price: Number(p.price) }))
                }))
            };

            const response = await fetch("/api/locations", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to update location");

            router.push("/admin/dashboard/locations");
            router.refresh();
        } catch (err: any) {
            console.error("Error submitting form:", err);
            setError(err.message || "Failed to update location");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                        </div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                        </div>
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
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/admin/dashboard/locations" className="flex items-center gap-2 text-gray-500 hover:text-manima-red transition-colors mb-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to All Locations
                    </Link>
                    <h1 className="text-2xl font-heading font-bold text-gray-900 tracking-tight">Edit Location</h1>
                    <p className="text-gray-500 mt-1 text-sm">Update location details and pricing</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Basic Info & Pricing */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Location Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Gaya"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all placeholder:text-gray-400"
                                        placeholder="City Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all placeholder:text-gray-400"
                                        placeholder="State Name"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Config Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-heading text-gray-700 border-b pb-2 flex items-center justify-between">
                            <span>Service Pricing Configuration</span>
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {formData.servicePackages.length} Services Selected
                            </span>
                        </h3>

                        {formData.servicePackages.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Tag className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No services selected.</p>
                                <p className="text-sm text-gray-400">Select services from the right panel to configure pricing.</p>
                            </div>
                        ) : (
                            formData.servicePackages.map((sp, sIndex) => (
                                <div key={sp.serviceId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-manima-gold"></div>

                                    <div className="flex justify-between items-center mb-6 border-b border-dashed pb-3">
                                        <h4 className="text-lg font-bold text-gray-800">{sp.serviceName}</h4>
                                        <button
                                            type="button"
                                            onClick={() => handleAddPricing(sIndex)}
                                            disabled={sp.pricing.length >= 3}
                                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${sp.pricing.length >= 3
                                                ? "text-gray-400 border border-gray-200 cursor-not-allowed"
                                                : "text-manima-red hover:text-white hover:bg-manima-red border border-manima-red"
                                                }`}
                                        >
                                            <Plus size={14} /> ADD PACKAGE {sp.pricing.length}/3
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {sp.pricing.map((price, pIndex) => (
                                            <div key={pIndex} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                                                <div className="absolute -left-1 top-4 w-10 h-6 bg-gray-200 rounded-r text-[10px] flex items-center justify-center font-bold text-gray-500 rotate-90 -translate-x-full group-hover:translate-x-0 transition-transform">
                                                    #{pIndex + 1}
                                                </div>

                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">Package Name</label>
                                                    <input
                                                        type="text"
                                                        value={price.name}
                                                        onChange={(e) => handlePricingChange(sIndex, pIndex, 'name', e.target.value)}
                                                        placeholder="e.g. Basic"
                                                        required
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-manima-gold outline-none text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">Price (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={price.price}
                                                        onChange={(e) => handlePricingChange(sIndex, pIndex, 'price', e.target.value)}
                                                        placeholder="e.g. 1500"
                                                        required
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-manima-gold outline-none text-sm"
                                                    />
                                                </div>
                                                <div className="flex-[2]">
                                                    <label className="text-xs text-gray-500 mb-1 block">Features (Press Enter to add)</label>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Add feature..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleFeatureAdd(sIndex, pIndex, e.currentTarget.value);
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-manima-gold outline-none text-sm"
                                                        />
                                                        <div className="flex flex-wrap gap-2">
                                                            {price.features?.map((feature, fIndex) => (
                                                                <span key={fIndex} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs text-gray-700">
                                                                    {feature}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleFeatureRemove(sIndex, pIndex, fIndex)}
                                                                        className="ml-1 text-gray-400 hover:text-red-500"
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-end pb-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePricing(sIndex, pIndex)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {sp.pricing.length === 0 && (
                                            <p className="text-sm text-center py-2 text-gray-400 italic">Click &quot;ADD PACKAGE&quot; to set pricing.</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column - Services & Submit */}
                <div className="space-y-8">
                    {/* Services Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2">Available Services</h3>

                        {services.length === 0 ? (
                            <p className="text-sm text-center py-6 text-gray-500 italic bg-gray-50 rounded">No services found in database.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {services.map((service) => {
                                    const isSelected = formData.servicePackages.some(sp => sp.serviceId === service._id);
                                    return (
                                        <label
                                            key={service._id}
                                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                                                ? "bg-red-50 border-manima-red/30 shadow-sm"
                                                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-manima-red border-manima-red text-white" : "border-gray-300 bg-white"
                                                }`}>
                                                {isSelected && <CheckCircle2 size={14} />}
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleServiceToggle(service)}
                                                    className="hidden"
                                                />
                                            </div>
                                            <div>
                                                <span className={`block text-sm font-medium ${isSelected ? "text-manima-red" : "text-gray-700"}`}>
                                                    {service.name}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="sticky top-24">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-manima-red to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isSubmitting ? "Updating Location..." : "Update Location"}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Ensure all details are correct before updating.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
