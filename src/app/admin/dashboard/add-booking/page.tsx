"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CalendarPlus, User, MapPin, Briefcase, CreditCard, Banknote, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Location {
    _id: string;
    name: string;
    services?: {
        service: string | { _id: string; name: string };
        pricing: { name: string; price: number; features?: string[] }[];
    }[];
}

interface Service {
    _id: string;
    name: string;
}

interface Agent {
    _id: string;
    name: string;
}

export default function AddBooking() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Data Sources
    const [locations, setLocations] = useState<Location[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);

    // Derived Data
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [availablePricing, setAvailablePricing] = useState<{ name: string; price: number }[]>([]);

    // Client Check
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [clientExists, setClientExists] = useState<boolean | null>(null);
    const [clientName, setClientName] = useState("");

    const [formData, setFormData] = useState({
        clientEmail: "",
        clientId: "",
        location: "",
        service: "",
        priceCategory: "",
        price: "",
        agent: "",
        paymentStatus: false, // false = Pending, true = Completed
        paymentDetails: "",
        transactionId: "",
        isCompleted: false,
    });

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, servRes] = await Promise.all([
                    fetch("/api/locations"),
                    fetch("/api/services")
                ]);

                if (locRes.ok && servRes.ok) {
                    const locData = await locRes.json();
                    const servData = await servRes.json();
                    setLocations(locData);
                    setAllServices(servData);
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch Agents when Location changes
    useEffect(() => {
        if (formData.location) {
            const fetchAgents = async () => {
                try {
                    const res = await fetch(`/api/agents?location=${formData.location}`);
                    if (res.ok) {
                        const data = await res.json();
                        setAgents(data);
                    }
                } catch (err) {
                    console.error("Error fetching agents:", err);
                }
            };
            fetchAgents();

            // Update Available Services
            const selectedLoc = locations.find(l => l._id === formData.location);
            if (selectedLoc) {
                const locServices = selectedLoc.services || [];
                const filteredServices = allServices.filter(s =>
                    locServices.some((ls: any) => {
                        const id = typeof ls === 'string' ? ls : (ls.service?._id || ls.service || "");
                        return id.toString() === s._id.toString();
                    }) || locServices.length === 0
                );
                setAvailableServices(filteredServices);
            }
        } else {
            setAgents([]);
            setAvailableServices([]);
        }
    }, [formData.location, locations, allServices]);

    // Update Available Pricing/Packages when Location or Service changes
    useEffect(() => {
        if (formData.location && formData.service) {
            const selectedLoc = locations.find(l => l._id === formData.location);
            if (selectedLoc) {
                const locServices = selectedLoc.services || [];
                const serviceEntry = locServices.find((ls: any) => {
                    const id = typeof ls === 'string' ? ls : (ls.service?._id || ls.service || "");
                    return id.toString() === formData.service.toString();
                });
                if (serviceEntry && serviceEntry.pricing) {
                    setAvailablePricing(serviceEntry.pricing);
                } else {
                    setAvailablePricing([]);
                }
            }
        } else {
            setAvailablePricing([]);
        }

        // Reset package selection and price when service or location changes
        setFormData(prev => ({ ...prev, priceCategory: "", price: "" }));
    }, [formData.location, formData.service, locations]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-set price if category is selected
        if (name === "priceCategory") {
            const selectedPrice = availablePricing.find(p => p.name === value);
            if (selectedPrice) {
                setFormData((prev) => ({ ...prev, price: selectedPrice.price.toString() }));
            }
        }
    };

    const handleToggle = (name: string) => {
        setFormData((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
    };

    const checkClientEmail = async () => {
        if (!formData.clientEmail) return;
        setCheckingEmail(true);
        setClientExists(null);
        setClientName("");

        try {
            const res = await fetch("/api/clients/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.clientEmail }),
            });
            const data = await res.json();
            if (data.exists) {
                setClientExists(true);
                setClientName(data.client.name);
                setFormData(prev => ({ ...prev, clientId: data.client._id }));
            } else {
                setClientExists(false);
                setFormData(prev => ({ ...prev, clientId: "" }));
            }
        } catch (err) {
            console.error("Error checking email:", err);
        } finally {
            setCheckingEmail(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientExists) {
            setError("Please provide a valid client email. Create the client first if they don't exist.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const payload = {
                client: formData.clientId,
                location: formData.location,
                service: formData.service,
                priceCategory: formData.priceCategory,
                price: Number(formData.price),
                agent: formData.agent || null,
                paymentStatus: formData.paymentStatus ? "Completed" : "Pending",
                paymentDetails: formData.paymentDetails,
                transactionId: formData.transactionId,
                status: formData.isCompleted ? "Completed" : "Confirmed", // Default to Confirmed if created
                isCompleted: formData.isCompleted,
            };

            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to create booking");

            setSuccess(true);
            setFormData({
                clientEmail: "",
                clientId: "",
                location: "",
                service: "",
                priceCategory: "",
                price: "",
                agent: "",
                paymentStatus: false,
                paymentDetails: "",
                transactionId: "",
                isCompleted: false,
            });
            setClientExists(null);
            setClientName("");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-manima-red" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-heading text-gray-800 mb-8 flex items-center gap-3">
                <CalendarPlus className="text-manima-red" />
                Add New Booking
            </h2>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 shadow-sm">
                    <p className="font-medium">Success</p>
                    <p>Booking created successfully!</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Client Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <User size={18} /> Client Details
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="clientEmail"
                                    value={formData.clientEmail}
                                    onChange={handleChange}
                                    onBlur={checkClientEmail}
                                    required
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 outline-none transition-all ${clientExists === false ? "border-red-300 focus:ring-red-200" :
                                        clientExists === true ? "border-green-300 focus:ring-green-200" :
                                            "border-gray-200 focus:ring-manima-gold/20 focus:border-manima-gold"
                                        }`}
                                    placeholder="Enter registered client email"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    {checkingEmail && <Loader2 className="animate-spin text-gray-400" size={18} />}
                                    {!checkingEmail && clientExists === true && <CheckCircle2 className="text-green-500" size={18} />}
                                    {!checkingEmail && clientExists === false && <AlertCircle className="text-red-500" size={18} />}
                                </div>
                            </div>
                            {clientExists === true && (
                                <p className="text-sm text-green-600 mt-1">Found: <strong>{clientName}</strong></p>
                            )}
                            {clientExists === false && (
                                <p className="text-sm text-red-500 mt-1">Client not found. Please add client first.</p>
                            )}
                        </div>
                    </div>

                    {/* Service Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <MapPin size={18} /> Service & Location
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all cursor-pointer"
                                >
                                    <option value="">Select Location</option>
                                    {locations.map((loc) => (
                                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                                <select
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.location}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">Select Service</option>
                                    {availableServices.length > 0 ? (
                                        availableServices.map((s) => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No services available</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Package</label>
                                <select
                                    name="priceCategory"
                                    value={formData.priceCategory}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.location || !formData.service}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">Select Package</option>
                                    {availablePricing.map((p, idx) => (
                                        <option key={idx} value={p.name}>{p.name} - ₹{p.price}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all"
                                    placeholder="Auto-filled or Custom"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Agent Assignment */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <Briefcase size={18} /> Assign Agent
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Agent</label>
                            <select
                                name="agent"
                                value={formData.agent}
                                onChange={handleChange}
                                disabled={!formData.location}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Select Agent (Optional)</option>
                                {agents.length > 0 ? (
                                    agents.map((a) => (
                                        <option key={a._id} value={a._id}>{a.name}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>No agents found for this location</option>
                                )}
                            </select>
                            {agents.length === 0 && formData.location && (
                                <p className="text-xs text-orange-500 mt-1">No agents registered for select location.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Payment & Status */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-heading text-gray-700 mb-6 border-b pb-2 flex items-center gap-2">
                            <CreditCard size={18} /> Payment & Status
                        </h3>

                        <div className="space-y-6">
                            {/* Payment Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700">Payment Completed?</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('paymentStatus')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.paymentStatus ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.paymentStatus ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {formData.paymentStatus && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID / Reference</label>
                                        <input
                                            type="text"
                                            name="transactionId"
                                            value={formData.transactionId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all text-sm"
                                            placeholder="e.g. UPI Ref: 1234567890"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes (Optional)</label>
                                        <textarea
                                            name="paymentDetails"
                                            value={formData.paymentDetails}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all text-sm"
                                            placeholder="Additional payment details..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {/* Completed Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700">Mark as Completed?</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('isCompleted')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isCompleted ? 'bg-manima-gold' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isCompleted ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-manima-red to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-8"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                {loading ? "Creating Booking..." : "Create Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
