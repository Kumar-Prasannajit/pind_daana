"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, IndianRupee, Save, MapPin, Tag, CheckCircle2 } from "lucide-react";

interface IPujaService {
    _id: string;
    name: string;
}

interface Package {
    name: string;
    features: string[];
    priceAmount: string;
}

interface ServicePricing {
    serviceId: string;
    serviceName: string;
    packages: Package[];
}

export default function AddPujaPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [pujaServices, setPujaServices] = useState<IPujaService[]>([]);
    const [fetchingServices, setFetchingServices] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        templeType: "",
        priority: "8",
    });

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [servicePackages, setServicePackages] = useState<ServicePricing[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/type-pujas");
                if (res.ok) {
                    const data = await res.json();
                    setPujaServices(data);
                }
            } catch (err) {
                console.error("Error fetching puja services:", err);
            } finally {
                setFetchingServices(false);
            }
        };
        fetchServices();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleServiceToggle = (service: IPujaService) => {
        setServicePackages((prev) => {
            const exists = prev.find(sp => sp.serviceId === service._id);
            if (exists) {
                return prev.filter(sp => sp.serviceId !== service._id);
            } else {
                return [
                    ...prev,
                    {
                        serviceId: service._id,
                        serviceName: service.name,
                        packages: [{ name: "", priceAmount: "", features: [] }]
                    }
                ];
            }
        });
    };

    const handleAddPackage = (serviceIndex: number) => {
        const newServicePackages = [...servicePackages];
        newServicePackages[serviceIndex].packages.push({ name: "", priceAmount: "", features: [] });
        setServicePackages(newServicePackages);
    };

    const handleRemovePackage = (serviceIndex: number, pkgIndex: number) => {
        const newServicePackages = [...servicePackages];
        newServicePackages[serviceIndex].packages = newServicePackages[serviceIndex].packages.filter((_, i) => i !== pkgIndex);
        setServicePackages(newServicePackages);
    };

    const handlePackageChange = (serviceIndex: number, pkgIndex: number, field: keyof Package, value: string) => {
        const newServicePackages = [...servicePackages];
        newServicePackages[serviceIndex].packages[pkgIndex][field] = value as never;
        setServicePackages(newServicePackages);
    };

    const handleFeatureAdd = (serviceIndex: number, pkgIndex: number, feature: string) => {
        if (!feature.trim()) return;
        const newServicePackages = [...servicePackages];
        newServicePackages[serviceIndex].packages[pkgIndex].features.push(feature.trim());
        setServicePackages(newServicePackages);
    };

    const handleFeatureRemove = (serviceIndex: number, pkgIndex: number, featureIndex: number) => {
        const newServicePackages = [...servicePackages];
        newServicePackages[serviceIndex].packages[pkgIndex].features = newServicePackages[serviceIndex].packages[pkgIndex].features.filter((_, i) => i !== featureIndex);
        setServicePackages(newServicePackages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("location", formData.location);
            data.append("templeType", formData.templeType);
            data.append("priority", formData.priority);

            // Clean service packages (remove empty features and parse numbers)
            const cleanedServices = servicePackages.map(sp => ({
                service: sp.serviceId,
                packages: sp.packages.map(pkg => ({
                    name: pkg.name,
                    features: pkg.features.filter(f => f.trim() !== ""),
                    priceAmount: pkg.priceAmount === "" ? 0 : Number(pkg.priceAmount)
                }))
            }));

            data.append("services", JSON.stringify(cleanedServices));

            if (file) {
                data.append("file", file);
            }

            const response = await fetch("/api/puja", {
                method: "POST",
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create puja");
            }

            router.push("/admin/dashboard/pujas");
            router.refresh();
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to create Puja. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-heading text-gray-800 mb-8 flex items-center gap-3 font-bold">
                <MapPin className="text-manima-red" />
                Add New Temple / Puja
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details & Packages */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2 font-bold">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Temple Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Sri Kashi Vishwanath Temple"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all placeholder:text-gray-400"
                                        placeholder="e.g. Varanasi, UP"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deity / Temple</label>
                                    <input
                                        type="text"
                                        name="templeType"
                                        value={formData.templeType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all placeholder:text-gray-400"
                                        placeholder="e.g. Shiva"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all text-sm font-medium text-gray-700"
                                    >
                                        <option value="1">Highest Priority</option>
                                        <option value="2">Higher Priority</option>
                                        <option value="3">High Priority</option>
                                        <option value="4">Medium Priority</option>
                                        <option value="5">Low Priority</option>
                                        <option value="6">Lower Priority</option>
                                        <option value="7">Lowest Priority</option>
                                        <option value="8">Standard (Default)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services Packages Configuration */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-heading text-gray-700 border-b pb-2 flex items-center justify-between font-bold">
                            <span>Services & Packages Confguration</span>
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {servicePackages.length} Services Selected
                            </span>
                        </h3>

                        {servicePackages.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Tag className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No services selected.</p>
                                <p className="text-sm text-gray-400">Select type pujas from the right panel to configure packages.</p>
                            </div>
                        ) : (
                            servicePackages.map((sp, sIndex) => (
                                <div key={sp.serviceId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-manima-gold"></div>

                                    <div className="flex justify-between items-center mb-6 border-b border-dashed pb-3">
                                        <h4 className="text-lg font-bold text-gray-800">{sp.serviceName}</h4>
                                        <button
                                            type="button"
                                            onClick={() => handleAddPackage(sIndex)}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all text-manima-red hover:text-white hover:bg-manima-red border border-manima-red"
                                        >
                                            <Plus size={14} /> ADD PACKAGE ({sp.packages.length})
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {sp.packages.map((pkg, pIndex) => (
                                            <div key={`package-${sIndex}-${pIndex}`} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                                                <div className="absolute -left-1 top-4 w-10 h-6 bg-gray-200 rounded-r text-[10px] flex items-center justify-center font-bold text-gray-500 rotate-90 -translate-x-full group-hover:translate-x-0 transition-transform">
                                                    #{pIndex + 1}
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Package Name</label>
                                                        <input
                                                            type="text"
                                                            value={pkg.name}
                                                            onChange={(e) => handlePackageChange(sIndex, pIndex, 'name', e.target.value)}
                                                            placeholder="e.g. Standard"
                                                            required
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-manima-red outline-none text-sm font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Price (₹)</label>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                                                            <input
                                                                type="number"
                                                                value={pkg.priceAmount}
                                                                onChange={(e) => handlePackageChange(sIndex, pIndex, 'priceAmount', e.target.value)}
                                                                placeholder="e.g. 1500"
                                                                required
                                                                className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded focus:border-manima-red outline-none text-sm font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-[2]">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Features</label>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Add feature and press Enter..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleFeatureAdd(sIndex, pIndex, e.currentTarget.value);
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:border-manima-red outline-none text-sm"
                                                        />
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {pkg.features?.map((feature, fIndex) => (
                                                                <span key={`feature-${sIndex}-${pIndex}-${fIndex}`} className="inline-flex items-center px-2 py-1.5 rounded bg-white border border-gray-200 text-xs text-gray-700 font-medium">
                                                                    {feature}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleFeatureRemove(sIndex, pIndex, fIndex)}
                                                                        className="ml-1.5 text-gray-400 hover:text-red-500 focus:outline-none"
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePackage(sIndex, pIndex)}
                                                        className="p-2 mt-6 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                        title="Remove Package"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {sp.packages.length === 0 && (
                                            <p className="text-sm text-center py-2 text-gray-400 italic">No packages configured. Click &quot;ADD PACKAGE&quot;.</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column - Image, Services list & Submit */}
                <div className="space-y-8">
                    {/* Image Upload Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-base font-heading font-bold text-gray-800 mb-3 border-b pb-2">Temple Image</h3>
                        <div className="w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden hover:border-manima-red/50 transition-colors group relative">
                            {previewUrl ? (
                                <>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="bg-red-500/90 text-white p-3 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                        <Plus className="h-8 w-8 text-manima-red" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Upload Photo</p>
                                    <p className="text-xs text-gray-500 mt-1">supports PNG, JPG</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        required={!file} // Required if no file selected
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Services Toggle Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-base font-heading font-bold text-gray-800 mb-4 border-b pb-2">Available Type Pujas</h3>

                        {fetchingServices ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                                <Loader2 size={24} className="animate-spin text-manima-red" />
                                <span className="text-sm">Loading pujas...</span>
                            </div>
                        ) : pujaServices.length === 0 ? (
                            <p className="text-sm text-center py-6 text-gray-500 italic bg-gray-50 rounded">No type pujas found. Add some in Type Pujas menu.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {pujaServices.map((service) => {
                                    const isSelected = servicePackages.some(sp => sp.serviceId === service._id);
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
                                                <span className={`block text-sm font-bold ${isSelected ? "text-manima-red" : "text-gray-700"}`}>
                                                    {service.name}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Actions Card */}
                    <div className="sticky top-24">
                        <button
                            type="submit"
                            disabled={isSubmitting || servicePackages.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-manima-red to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isSubmitting ? "Saving Puja..." : "Save Puja"}
                        </button>
                        {servicePackages.length === 0 && (
                            <p className="text-center text-xs text-red-500 mt-2 font-medium">
                                Select at least one type puja to save.
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
