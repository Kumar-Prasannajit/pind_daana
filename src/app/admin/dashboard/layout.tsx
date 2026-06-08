"use client";

import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const getTitle = () => {
        switch (pathname) {
            case "/admin/dashboard":
                return "Dashboard";
            case "/admin/dashboard/add-client":
                return "Add Client";
            case "/admin/dashboard/add-location":
                return "Add Location";
            case "/admin/dashboard/locations":
                return "All Locations";
            case "/admin/dashboard/add-agent":
                return "Add Agent";
            case "/admin/dashboard/add-booking":
                return "Add Booking";
            case "/admin/dashboard/add-pandit":
                return "Add Pandit";
            case "/admin/dashboard/add-service":
                return "Add Service";
            case "/admin/dashboard/services":
                return "All Services";
            case "/admin/dashboard/add-puja":
                return "Add Puja";
            case "/admin/dashboard/pujas":
                return "All Temples";
            case "/admin/dashboard/type-pujas":
                return "Type Pujas";
            case "/admin/dashboard/add-type-puja":
                return "Add Type Puja";
            case "/admin/dashboard/add-coupon":
                return "Add Coupon";
            case "/admin/dashboard/coupons":
                return "Coupons";
            case "/admin/dashboard/testimonials":
                return "Testimonials";
            default:
                if (pathname?.startsWith("/admin/dashboard/edit-puja/")) {
                    return "Edit Puja";
                }
                if (pathname?.startsWith("/admin/dashboard/edit-type-puja/")) {
                    return "Edit Type Puja";
                }
                if (pathname?.startsWith("/admin/dashboard/edit-service/")) {
                    return "Edit Service";
                }
                if (pathname?.startsWith("/admin/dashboard/edit-location/")) {
                    return "Edit Location";
                }
                return "Admin";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 md:ml-64 flex flex-col">
                <AdminHeader title={getTitle()} />
                <main className="p-6 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
