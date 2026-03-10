"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Plus, Edit2, MapPin, Search, Trash2 } from "lucide-react";

interface ILocation {
    _id: string;
    name: string;
    city: string;
    state: string;
    services: any[];
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<ILocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await fetch("/api/locations");
            const data = await response.json();
            if (Array.isArray(data)) {
                setLocations(data);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this location?")) return;

        try {
            const res = await fetch(`/api/locations?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                setLocations(locations.filter(l => l._id !== id));
            } else {
                alert(data.error || "Failed to delete location");
            }
        } catch (error) {
            console.error("Error deleting location:", error);
            alert("Failed to delete location");
        }
    };

    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.state.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-2xl font-heading font-bold text-gray-900">All Locations</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your service locations</p>
                </div>
                <Link
                    href="/admin/dashboard/add-location"
                    className="flex items-center gap-2 bg-manima-red text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add New Location
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, city, or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-manima-red/20 focus:border-manima-red outline-none transition-all placeholder-gray-400"
                />
            </div>

            {locations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="text-manima-red" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Locations Found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first location to the platform.</p>
                    <Link
                        href="/admin/dashboard/add-location"
                        className="inline-flex items-center gap-2 bg-manima-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                    >
                        <Plus size={20} />
                        Add First Location
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map((location) => (
                        <div key={location._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-manima-red">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/dashboard/edit-location/${location._id}`}
                                        className="p-2 text-gray-400 hover:text-manima-red hover:bg-red-50 rounded-lg transition-colors"
                                        title="Edit Location"
                                    >
                                        <Edit2 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(location._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Location"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">{location.name}</h3>
                            <p className="text-gray-500 text-sm mb-4">{location.city}, {location.state}</p>

                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {location.services?.length || 0} Services
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
