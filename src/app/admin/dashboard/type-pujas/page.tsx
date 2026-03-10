"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Plus, Edit2, Archive, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface IPujaService {
    _id: string;
    name: string;
    significance: string;
}

export default function TypePujasPage() {
    const [typePujas, setTypePujas] = useState<IPujaService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTypePujas();
    }, []);

    const fetchTypePujas = async () => {
        try {
            const response = await fetch("/api/type-pujas");
            const data = await response.json();
            if (Array.isArray(data)) {
                setTypePujas(data);
            }
        } catch (error) {
            console.error("Error fetching type pujas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this type puja?")) return;

        try {
            const response = await fetch(`/api/type-pujas/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete type puja");
            }

            toast.success("Type Puja deleted successfully");
            fetchTypePujas(); // Refresh list after deletion
        } catch (error) {
            console.error("Error deleting type puja:", error);
            toast.error("Failed to delete type puja");
        }
    };

    const filteredTypePujas = typePujas.filter(puja =>
        puja.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-manima-red" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">Type Pujas</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage different types of pujas</p>
                </div>
                <Link
                    href="/admin/dashboard/add-type-puja"
                    className="flex items-center gap-2 bg-manima-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add New Type Puja
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by puja name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all placeholder-gray-400"
                />
            </div>

            {typePujas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Archive className="text-manima-red" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Type Pujas Found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first type puja to the platform.</p>
                    <Link
                        href="/admin/dashboard/add-type-puja"
                        className="inline-flex items-center gap-2 bg-manima-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                    >
                        <Plus size={20} />
                        Add First Type Puja
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTypePujas.map((puja) => (
                        <div key={puja._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-manima-red">
                                    <Archive size={20} />
                                </div>
                                <div className="flex gap-2 relative z-10">
                                    <Link
                                        href={`/admin/dashboard/edit-type-puja/${puja._id}`}
                                        className="p-2 text-gray-400 hover:text-manima-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Type Puja"
                                    >
                                        <Edit2 size={18} />
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(puja._id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Type Puja"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{puja.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-4 h-15">
                                {puja.significance}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
