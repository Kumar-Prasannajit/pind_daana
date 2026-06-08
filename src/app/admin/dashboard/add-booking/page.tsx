"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    Banknote,
    Briefcase,
    CalendarPlus,
    CheckCircle2,
    CreditCard,
    Loader2,
    Mail,
    Package,
    Phone,
    Save,
    User,
} from "lucide-react";

interface TypePuja {
    _id: string;
    name: string;
}

interface PujaPackage {
    name: string;
    priceAmount: number;
    features?: string[];
}

interface Puja {
    _id: string;
    name: string;
    location: string;
    services?: {
        service: string | { _id: string; name: string };
        packages?: PujaPackage[];
    }[];
}

interface Service {
    _id: string;
    name: string;
}

interface ServicePackage {
    name: string;
    price: number;
    features?: string[];
}

interface Location {
    _id: string;
    name: string;
    city?: string;
    state?: string;
    services?: {
        service: string | { _id: string; name: string };
        pricing?: ServicePackage[];
    }[];
}

interface Agent {
    _id: string;
    name: string;
    phone?: string;
    location?: string | { _id: string; name: string };
}

type BookingMode = "puja" | "service";

type BookingPayload = {
    client: string;
    priceCategory: string;
    package: string;
    price: number;
    agent?: string;
    paymentStatus: "Pending" | "Completed";
    paymentMethod: "qr";
    paymentDetails: string;
    transactionId?: string;
    puja?: string;
    pujaService?: string;
    service?: string;
    location?: string;
};

const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-manima-gold/20 focus:border-manima-gold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

const getRefId = (value: string | { _id: string } | undefined) =>
    typeof value === "string" ? value : value?._id || "";

export default function AddBooking() {
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [typePujas, setTypePujas] = useState<TypePuja[]>([]);
    const [pujas, setPujas] = useState<Puja[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);

    const [checkingEmail, setCheckingEmail] = useState(false);
    const [clientExists, setClientExists] = useState<boolean | null>(null);
    const [clientName, setClientName] = useState("");

    const [formData, setFormData] = useState({
        clientEmail: "",
        clientPhone: "",
        clientId: "",
        mode: "puja" as BookingMode,
        typePuja: "",
        puja: "",
        pujaPackage: "",
        service: "",
        location: "",
        servicePackage: "",
        price: "",
        transactionId: "",
        paymentStatus: false,
        agent: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typePujaRes, pujaRes, serviceRes, locationRes, agentRes] = await Promise.all([
                    fetch("/api/type-pujas"),
                    fetch("/api/puja"),
                    fetch("/api/services"),
                    fetch("/api/locations"),
                    fetch("/api/agents"),
                ]);

                const [typePujaData, pujaData, serviceData, locationData, agentData] = await Promise.all([
                    typePujaRes.json(),
                    pujaRes.json(),
                    serviceRes.json(),
                    locationRes.json(),
                    agentRes.json(),
                ]);

                setTypePujas(Array.isArray(typePujaData) ? typePujaData : []);
                setPujas(Array.isArray(pujaData?.data) ? pujaData.data : []);
                setServices(Array.isArray(serviceData) ? serviceData : []);
                setLocations(Array.isArray(locationData) ? locationData : []);
                setAgents(Array.isArray(agentData) ? agentData : []);
            } catch (err) {
                console.error("Error fetching booking form data:", err);
                setError("Could not load booking form data. Please refresh and try again.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, []);

    const selectedPuja = useMemo(
        () => pujas.find((puja) => puja._id === formData.puja),
        [pujas, formData.puja]
    );

    const selectedPujaService = useMemo(
        () => selectedPuja?.services?.find((entry) => getRefId(entry.service) === formData.typePuja),
        [selectedPuja, formData.typePuja]
    );

    const availablePujas = useMemo(
        () =>
            formData.typePuja
                ? pujas.filter((puja) =>
                    puja.services?.some((entry) => getRefId(entry.service) === formData.typePuja)
                )
                : [],
        [pujas, formData.typePuja]
    );

    const pujaPackages = selectedPujaService?.packages || [];

    const selectedLocation = useMemo(
        () => locations.find((location) => location._id === formData.location),
        [locations, formData.location]
    );

    const availableLocations = useMemo(
        () =>
            formData.service
                ? locations.filter((location) =>
                    location.services?.some((entry) => getRefId(entry.service) === formData.service)
                )
                : [],
        [locations, formData.service]
    );

    const selectedLocationService = useMemo(
        () => selectedLocation?.services?.find((entry) => getRefId(entry.service) === formData.service),
        [selectedLocation, formData.service]
    );

    const servicePackages = selectedLocationService?.pricing || [];

    const visibleAgents = useMemo(() => {
        if (formData.mode !== "service" || !formData.location) return agents;
        const filtered = agents.filter((agent) => getRefId(agent.location) === formData.location);
        return filtered.length > 0 ? filtered : agents;
    }, [agents, formData.location, formData.mode]);

    const selectedOfferingName =
        formData.mode === "puja"
            ? selectedPuja?.name || "-"
            : services.find((service) => service._id === formData.service)?.name || "-";

    const selectedPlaceName =
        formData.mode === "puja"
            ? selectedPuja?.location || "-"
            : selectedLocation?.name || "-";

    const selectedPackageName =
        formData.mode === "puja" ? formData.pujaPackage : formData.servicePackage;

    const updateField = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const switchMode = (mode: BookingMode) => {
        setFormData((prev) => ({
            ...prev,
            mode,
            typePuja: "",
            puja: "",
            pujaPackage: "",
            service: "",
            location: "",
            servicePackage: "",
            price: "",
            agent: "",
        }));
        setError("");
        setSuccess(false);
    };

    const handlePujaTypeChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            typePuja: value,
            puja: "",
            pujaPackage: "",
            price: "",
        }));
    };

    const handlePujaChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            puja: value,
            pujaPackage: "",
            price: "",
        }));
    };

    const handlePujaPackageChange = (value: string) => {
        const selectedPackage = pujaPackages.find((pkg) => pkg.name === value);
        setFormData((prev) => ({
            ...prev,
            pujaPackage: value,
            price: selectedPackage ? String(selectedPackage.priceAmount) : "",
        }));
    };

    const handleServiceChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            service: value,
            location: "",
            servicePackage: "",
            price: "",
            agent: "",
        }));
    };

    const handleLocationChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            location: value,
            servicePackage: "",
            price: "",
            agent: "",
        }));
    };

    const handleServicePackageChange = (value: string) => {
        const selectedPackage = servicePackages.find((pkg) => pkg.name === value);
        setFormData((prev) => ({
            ...prev,
            servicePackage: value,
            price: selectedPackage ? String(selectedPackage.price) : "",
        }));
    };

    const checkClientEmail = async () => {
        const email = formData.clientEmail.trim();
        if (!email) return;

        setCheckingEmail(true);
        setClientExists(null);
        setClientName("");

        try {
            const res = await fetch("/api/clients/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.exists) {
                setClientExists(true);
                setClientName(data.client.name);
                setFormData((prev) => ({
                    ...prev,
                    clientId: data.client._id,
                    clientPhone: data.client.whatsapp_number || data.client.phone || prev.clientPhone,
                }));
            } else {
                setClientExists(false);
                setFormData((prev) => ({ ...prev, clientId: "" }));
            }
        } catch (err) {
            console.error("Error checking email:", err);
            setClientExists(false);
        } finally {
            setCheckingEmail(false);
        }
    };

    const validateForm = () => {
        if (!clientExists || !formData.clientId) {
            return "Please provide a registered client email. Create the client first if they do not exist.";
        }
        if (!formData.clientPhone.trim()) {
            return "Please enter the client's WhatsApp phone number.";
        }
        if (formData.mode === "puja") {
            if (!formData.typePuja || !formData.puja || !formData.pujaPackage) {
                return "Please select puja type, temple, and package.";
            }
        } else if (!formData.service || !formData.location || !formData.servicePackage) {
            return "Please select service, location, and package.";
        }
        if (!formData.price || Number(formData.price) <= 0) {
            return "A valid price could not be fetched for the selected package.";
        }
        if (formData.paymentStatus && !formData.transactionId.trim()) {
            return "Please enter the payment UTR number when payment is completed.";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setSuccess(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const packageName = selectedPackageName;
            const payload: BookingPayload = {
                client: formData.clientId,
                priceCategory: packageName,
                package: packageName,
                price: Number(formData.price),
                agent: formData.agent || undefined,
                paymentStatus: formData.paymentStatus ? "Completed" : "Pending",
                paymentMethod: "qr",
                paymentDetails: formData.paymentStatus ? "Manual admin payment entry" : "",
                transactionId: formData.transactionId.trim() || undefined,
            };

            if (formData.mode === "puja") {
                payload.puja = formData.puja;
                payload.pujaService = formData.typePuja;
            } else {
                payload.service = formData.service;
                payload.location = formData.location;
            }

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
                clientPhone: "",
                clientId: "",
                mode: formData.mode,
                typePuja: "",
                puja: "",
                pujaPackage: "",
                service: "",
                location: "",
                servicePackage: "",
                price: "",
                transactionId: "",
                paymentStatus: false,
                agent: "",
            });
            setClientExists(null);
            setClientName("");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create booking");
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
        <div className="max-w-5xl mx-auto">
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
                    <p>Booking created successfully.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <User size={18} /> User Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={formData.clientEmail}
                                        onChange={(e) => updateField("clientEmail", e.target.value)}
                                        onBlur={checkClientEmail}
                                        required
                                        className={`${inputClass} pl-10 pr-10 ${clientExists === false
                                            ? "border-red-300 focus:ring-red-200"
                                            : clientExists === true
                                                ? "border-green-300 focus:ring-green-200"
                                                : ""
                                            }`}
                                        placeholder="client@example.com"
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
                                    <p className="text-sm text-red-500 mt-1">Client not found. Please add the client first.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone No. (WhatsApp Only)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={formData.clientPhone}
                                        onChange={(e) => updateField("clientPhone", e.target.value)}
                                        required
                                        className={`${inputClass} pl-10`}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <Package size={18} /> Puja / Service Details
                        </h3>

                        <div className="inline-flex rounded-lg bg-gray-100 p-1 mb-6 border border-gray-200">
                            {(["puja", "service"] as BookingMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => switchMode(mode)}
                                    className={`px-5 py-2 rounded-md text-sm font-semibold capitalize transition-all ${formData.mode === mode
                                        ? "bg-white text-manima-red shadow-sm"
                                        : "text-gray-500 hover:text-gray-800"
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {formData.mode === "puja" ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Puja Type</label>
                                    <select
                                        value={formData.typePuja}
                                        onChange={(e) => handlePujaTypeChange(e.target.value)}
                                        required
                                        className={`${inputClass} cursor-pointer`}
                                    >
                                        <option value="">Select available puja</option>
                                        {typePujas.map((typePuja) => (
                                            <option key={typePuja._id} value={typePuja._id}>
                                                {typePuja.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Temple</label>
                                        <select
                                            value={formData.puja}
                                            onChange={(e) => handlePujaChange(e.target.value)}
                                            disabled={!formData.typePuja}
                                            required
                                            className={`${inputClass} cursor-pointer`}
                                        >
                                            <option value="">Select temple for this puja</option>
                                            {availablePujas.map((puja) => (
                                                <option key={puja._id} value={puja._id}>
                                                    {puja.name} - {puja.location}
                                                </option>
                                            ))}
                                        </select>
                                        {formData.typePuja && availablePujas.length === 0 && (
                                            <p className="text-xs text-orange-500 mt-1">No temples are configured for this puja.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
                                        <select
                                            value={formData.pujaPackage}
                                            onChange={(e) => handlePujaPackageChange(e.target.value)}
                                            disabled={!formData.puja}
                                            required
                                            className={`${inputClass} cursor-pointer`}
                                        >
                                            <option value="">Select package</option>
                                            {pujaPackages.map((pkg) => (
                                                <option key={pkg.name} value={pkg.name}>
                                                    {pkg.name} - Rs. {pkg.priceAmount.toLocaleString("en-IN")}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                                    <select
                                        value={formData.service}
                                        onChange={(e) => handleServiceChange(e.target.value)}
                                        required
                                        className={`${inputClass} cursor-pointer`}
                                    >
                                        <option value="">Select service</option>
                                        {services.map((service) => (
                                            <option key={service._id} value={service._id}>
                                                {service.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                        <select
                                            value={formData.location}
                                            onChange={(e) => handleLocationChange(e.target.value)}
                                            disabled={!formData.service}
                                            required
                                            className={`${inputClass} cursor-pointer`}
                                        >
                                            <option value="">Select location for this service</option>
                                            {availableLocations.map((location) => (
                                                <option key={location._id} value={location._id}>
                                                    {location.name}
                                                    {location.city ? `, ${location.city}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {formData.service && availableLocations.length === 0 && (
                                            <p className="text-xs text-orange-500 mt-1">No locations are configured for this service.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
                                        <select
                                            value={formData.servicePackage}
                                            onChange={(e) => handleServicePackageChange(e.target.value)}
                                            disabled={!formData.location}
                                            required
                                            className={`${inputClass} cursor-pointer`}
                                        >
                                            <option value="">Select package</option>
                                            {servicePackages.map((pkg) => (
                                                <option key={pkg.name} value={pkg.name}>
                                                    {pkg.name} - Rs. {pkg.price.toLocaleString("en-IN")}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fetched Price</label>
                                <div className="relative">
                                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        value={formData.price}
                                        readOnly
                                        required
                                        className={`${inputClass} pl-10 font-semibold text-gray-800`}
                                        placeholder="Auto-filled"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment UTR No.</label>
                                <input
                                    type="text"
                                    value={formData.transactionId}
                                    onChange={(e) => updateField("transactionId", e.target.value)}
                                    className={inputClass}
                                    placeholder="Enter UTR / transaction reference"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <Briefcase size={18} /> Assign Agent
                        </h3>
                        <select
                            value={formData.agent}
                            onChange={(e) => updateField("agent", e.target.value)}
                            className={`${inputClass} cursor-pointer`}
                        >
                            <option value="">Select agent (optional)</option>
                            {visibleAgents.map((agent) => (
                                <option key={agent._id} value={agent._id}>
                                    {agent.name}
                                    {agent.phone ? ` - ${agent.phone}` : ""}
                                </option>
                            ))}
                        </select>
                        {visibleAgents.length === 0 && (
                            <p className="text-xs text-orange-500 mt-1">No agents are available.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-heading text-gray-700 mb-6 border-b pb-2 flex items-center gap-2">
                            <CreditCard size={18} /> Payment & Summary
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                            <span className="font-medium text-gray-700">Payment Completed?</span>
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, paymentStatus: !prev.paymentStatus }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.paymentStatus ? "bg-green-500" : "bg-gray-300"}`}
                                aria-pressed={formData.paymentStatus}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.paymentStatus ? "translate-x-6" : "translate-x-1"}`}
                                />
                            </button>
                        </div>

                        <div className="space-y-3 text-sm mb-8">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Type</span>
                                <span className="font-medium capitalize text-gray-800">{formData.mode}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Offering</span>
                                <span className="font-medium text-gray-800 text-right">{selectedOfferingName}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Place</span>
                                <span className="font-medium text-gray-800 text-right">{selectedPlaceName}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Package</span>
                                <span className="font-medium text-gray-800 text-right">{selectedPackageName || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-gray-600 font-semibold">Price</span>
                                <span className="font-bold text-xl text-manima-red">
                                    {formData.price ? `Rs. ${Number(formData.price).toLocaleString("en-IN")}` : "-"}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-manima-red to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {loading ? "Creating Booking..." : "Create Booking"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
