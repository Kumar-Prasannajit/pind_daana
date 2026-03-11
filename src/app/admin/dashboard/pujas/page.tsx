"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Plus, Edit2, MapPin, Building2, Search, Trash2 } from "lucide-react";

interface IPackage {
    name: string;
    features: string[];
    priceAmount: number;
}

interface IPuja {
    _id: string;
    imageUrl: string;
    name: string;
    location: string;
    templeType: string;
    services: {
        service: string;
        packages: IPackage[];
        _id: string;
    }[];
}

export default function PujasPage() {
    const [pujas, setPujas] = useState<IPuja[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPujas();
    }, []);

    const fetchPujas = async () => {
        try {
            const response = await fetch("/api/puja");
            const data = await response.json();
            if (data.success) {
                setPujas(data.data);
            }
        } catch (error) {
            console.error("Error fetching pujas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this puja?")) return;

        try {
            const res = await fetch(`/api/puja?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setPujas(pujas.filter(p => p._id !== id));
            } else {
                alert(data.message || "Failed to delete puja");
            }
        } catch (error) {
            console.error("Error deleting puja:", error);
            alert("Failed to delete puja");
        }
    };

    const filteredPujas = pujas.filter(puja =>
        puja.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        puja.location.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-[340px] flex flex-col">
                            <div className="h-48 bg-gray-200 w-full relative">
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <div className="w-8 h-8 bg-white/50 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-white/50 rounded-lg"></div>
                                </div>
                                <div className="absolute bottom-4 left-4 w-20 h-5 bg-white/50 rounded"></div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="flex gap-2 items-center mb-4">
                                    <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-50">
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
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
                    <h1 className="text-2xl font-heading font-bold text-gray-900">All Pujas</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your puja services</p>
                </div>
                <Link
                    href="/admin/dashboard/add-puja"
                    className="flex items-center gap-2 bg-manima-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add New Puja
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by puja name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all placeholder-gray-400"
                />
            </div>

            {pujas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-manima-red" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Pujas Found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first puja service to the platform.</p>
                    <Link
                        href="/admin/dashboard/add-puja"
                        className="inline-flex items-center gap-2 bg-manima-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                    >
                        <Plus size={20} />
                        Add First Puja
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPujas.map((puja) => (
                        <div key={puja._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={puja.imageUrl}
                                    alt={puja.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <Link
                                        href={`/admin/dashboard/edit-puja/${puja._id}`}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-gray-700 hover:text-manima-red hover:bg-white transition-all flex items-center justify-center"
                                        title="Edit Puja"
                                    >
                                        <Edit2 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(puja._id)}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-gray-700 hover:text-red-600 hover:bg-white transition-all flex items-center justify-center"
                                        title="Delete Puja"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <span className="inline-block px-2 py-1 bg-manima-gold/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded">
                                        {puja.templeType}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 line-clamp-1">{puja.name}</h3>
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                    <MapPin size={16} className="text-manima-red" />
                                    <span className="line-clamp-1">{puja.location}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="text-xs font-medium text-gray-500">
                                        {puja.services?.reduce((total, s) => total + (s.packages?.length || 0), 0) || 0} Packages Available
                                    </div>
                                    <div className="font-bold text-manima-red text-sm">
                                        From ₹{
                                            puja.services && puja.services.length > 0
                                                ? Math.min(...puja.services.flatMap(s => s.packages.map(p => p.priceAmount))).toLocaleString('en-IN')
                                                : 0
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
