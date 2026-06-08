"use client";

import { useState } from "react";
import Link from "next/link";
import {
    usePathname
} from "next/navigation";
import {
    LayoutDashboard,
    Users,
    MapPin,
    UserCheck,
    UserCog,
    Briefcase,
    CalendarPlus,
    UserPlus,
    PackagePlus,
    ChevronDown,
    Plus,
    Tag,
    MessageSquareHeart,
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const [isBookingsOpen, setIsBookingsOpen] = useState(true);

    const links = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        // Bookings Dropdown Group
        {
            label: "Bookings",
            icon: CalendarPlus,
            isGroup: true,
            isOpen: isBookingsOpen,
            toggle: () => setIsBookingsOpen(!isBookingsOpen),
            subLinks: [
                { href: "/admin/dashboard/bookings", label: "All Bookings" },
                { href: "/admin/dashboard/add-booking", label: "New Booking" },
            ]
        },
        { href: "/admin/dashboard/add-client", label: "Add Client", icon: UserPlus },
        { href: "/admin/dashboard/locations", label: "All Locations", icon: MapPin },
        { href: "/admin/dashboard/add-agent", label: "Add Agent", icon: Users },
        { href: "/admin/dashboard/add-pandit", label: "Add Pandit", icon: UserCog },
        { href: "/admin/dashboard/services", label: "All Services", icon: PackagePlus },
        { href: "/admin/dashboard/type-pujas", label: "Type Puja", icon: PackagePlus },
        { href: "/admin/dashboard/puri-pujas", label: "Puri Pujas", icon: PackagePlus },
        { href: "/admin/dashboard/pujas", label: "All Temples", icon: PackagePlus },
        { href: "/admin/dashboard/coupons", label: "Coupons", icon: Tag },
        { href: "/admin/dashboard/testimonials", label: "Testimonials", icon: MessageSquareHeart },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto z-10 hidden md:block">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-heading text-manima-red">
                    Manima <span className="text-manima-gold">Admin</span>
                </h1>
            </div>
            <nav className="p-4 space-y-1">
                {links.map((link: any, idx) => {
                    if (link.isGroup) {
                        return (
                            <div key={idx} className="space-y-1">
                                <button
                                    onClick={link.toggle}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <link.icon size={20} className="text-gray-400" />
                                        {link.label}
                                    </div>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${link.isOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {link.isOpen && (
                                    <div className="pl-11 space-y-1">
                                        {link.subLinks.map((subLink: any) => {
                                            const isActive = pathname === subLink.href;
                                            return (
                                                <Link
                                                    key={subLink.href}
                                                    href={subLink.href}
                                                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                        ? "bg-red-50 text-manima-red"
                                                        : "text-gray-500 hover:text-gray-900"
                                                        }`}
                                                >
                                                    {subLink.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? "bg-red-50 text-manima-red"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "text-manima-red" : "text-gray-400"} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 text-center">
                    &copy; {new Date().getFullYear()} Manima Admin
                </p>
            </div>
        </aside>
    );
}
