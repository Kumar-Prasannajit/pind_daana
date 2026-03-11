"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Plus, Edit2, Package, Search, Trash2 } from "lucide-react";

interface IService {
    _id: string;
    name: string;
    details: string;
}

export default function ServicesPage() {
    const [services, setServices] = useState<IService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch("/api/services");
            const data = await response.json();
            // API returns array directly based on route.ts
            if (Array.isArray(data)) {
                setServices(data);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;

        try {
            const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                setServices(services.filter(s => s._id !== id));
            } else {
                alert(data.error || "Failed to delete service");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Failed to delete service");
        }
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6 w-full animate-pulse">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-xl w-full mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-48 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="space-y-2 mt-auto">
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">All Services</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your service offerings</p>
                </div>
                <Link
                    href="/admin/dashboard/add-service"
                    className="flex items-center gap-2 bg-manima-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add New Service
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by service name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all placeholder-gray-400"
                />
            </div>

            {services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="text-manima-red" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Services Found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first service to the platform.</p>
                    <Link
                        href="/admin/dashboard/add-service"
                        className="inline-flex items-center gap-2 bg-manima-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                    >
                        <Plus size={20} />
                        Add First Service
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div key={service._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-manima-red">
                                    <Package size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/dashboard/edit-service/${service._id}`}
                                        className="p-2 text-gray-400 hover:text-manima-red hover:bg-red-50 rounded-lg transition-colors"
                                        title="Edit Service"
                                    >
                                        <Edit2 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(service._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Service"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-4 h-15">
                                {service.details}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
