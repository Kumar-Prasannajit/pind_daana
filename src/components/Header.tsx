"use client";
import React, { useState, useEffect } from "react";
// import "./Header.css"; // Removed custom CSS
import PujaModal from "./PujaModal";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard } from "lucide-react";

interface HeaderProps {
    onOpenPuja?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenPuja }) => {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [client, setClient] = useState<{ _id: string; name: string } | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleOpenPuja = () => {
        if (onOpenPuja) {
            onOpenPuja();
        } else {
            setOpenModal(true);
        }
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const checkAuth = async () => {
            // Check if the auth cookie exists before making the API call
            const hasAuthCookie = document.cookie.split(';').some((item) => item.trim().startsWith('client_auth_status='));

            if (!hasAuthCookie) {
                setClient(null);
                return;
            }

            try {
                const res = await fetch("/api/client/me");
                if (res.ok) {
                    const data = await res.json();
                    setClient(data);
                } else {
                    setClient(null);
                }
            } catch (error) {
                console.error("Auth check failed", error);
                setClient(null);
            }
        };

        window.addEventListener("scroll", handleScroll);
        checkAuth();

        const handleAuthChange = () => checkAuth();
        window.addEventListener("auth-change", handleAuthChange);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("auth-change", handleAuthChange);
        };
    }, [pathname]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        try {
            await fetch("/api/client/logout", { method: "POST" });
            setClient(null);
            window.location.href = "/"; // Redirect to Home
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Derived state for header style
    const isHeaderScrolled = isScrolled || !isHome;

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full transition-all duration-300 ease-in-out py-2 ${mobileMenuOpen ? "z-[999]" : "z-50"
                    } ${isHeaderScrolled
                        ? "bg-[#FDFAF0] shadow-md"
                        : "bg-transparent"
                    }`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center">

                    <div className="flex items-center">
                        <Link href="/">
                            <Image
                                id="header-logo"
                                src="/assets/manima_logo.png"
                                alt="Manima Logo"
                                width={180}
                                height={50}
                                className={`h-[35px] md:h-[50px] w-auto transition-opacity duration-300 ${!isHome && !mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                                unoptimized
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex gap-8 items-center">
                        {[
                            { name: 'Home', href: '/' },
                            { name: 'Services', href: '/#Services', id: 'Services' },
                            { name: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
                            { name: 'Contact', href: '#contact', id: 'contact' }
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`font-semibold text-base transition-colors duration-300 relative group ${isHeaderScrolled ? "text-manima-saffron hover:text-primary" : "text-manima-gold hover:text-white"
                                    }`}
                                onClick={(e) => {
                                    if (item.id) {
                                        const section = document.getElementById(item.id);
                                        if (section) {
                                            e.preventDefault();
                                            section.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    } else if (window.location.pathname === '/') {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                }}
                            >
                                {item.name}
                                <span className={`absolute left-0 bottom-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${isHeaderScrolled ? "bg-manima-saffron" : "bg-manima-gold"}`}></span>
                            </Link>
                        ))}
                        {client ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isHeaderScrolled ? "bg-manima-red text-white hover:bg-manima-dark-red" : "bg-white/10 backdrop-blur-sm border border-manima-gold text-manima-gold hover:bg-manima-gold hover:text-white"}`}
                                >
                                    <User size={20} />
                                </button>
                                
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{client.name}</p>
                                        </div>
                                        <Link
                                            href="/client/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-manima-saffron transition-colors"
                                        >
                                            <LayoutDashboard size={16} />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut size={16} />
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/client/login"
                                className={`px-5 py-2 rounded-full font-semibold text-base transition-all duration-300 ${isHeaderScrolled
                                    ? "bg-manima-red text-white hover:bg-manima-dark-red shadow-md"
                                    : "bg-white/10 backdrop-blur-sm border border-manima-gold text-manima-gold hover:bg-manima-gold hover:text-white"
                                    }`}
                            >
                                Login
                            </Link>
                        )}
                    </nav>

                    <div
                        className="flex flex-col justify-center gap-[5px] cursor-pointer md:hidden relative z-[1000] w-[25px] h-[25px]"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className={`w-full h-[3px] rounded-full transition-all duration-300 origin-center ${isHeaderScrolled ? "bg-manima-saffron" : "bg-manima-gold shadow-sm"} ${mobileMenuOpen ? "rotate-45 translate-y-[8px]" : ""}`}></span>
                        <span className={`w-full h-[3px] rounded-full transition-all duration-300 ${isHeaderScrolled ? "bg-manima-saffron" : "bg-manima-gold shadow-sm"} ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
                        <span className={`w-full h-[3px] rounded-full transition-all duration-300 origin-center ${isHeaderScrolled ? "bg-manima-saffron" : "bg-manima-gold shadow-sm"} ${mobileMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`}></span>
                    </div>
                </div>

                {/* Mobile Menu */}
                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 bg-[#FDFAF0]/95 backdrop-blur-md z-[999] flex flex-col items-center justify-center gap-8 transition-all duration-500 ease-in-out md:hidden ${mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                        }`}
                >
                    {/* Logo in Menu */}
                    <div className="mb-8">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                            <Image
                                src="/assets/manima_logo.png"
                                alt="Manima"
                                width={160}
                                height={50}
                                className="h-[50px] w-auto"
                                unoptimized
                            />
                        </Link>
                    </div>

                    {/* Menu Links */}
                    <nav className="flex flex-col items-center gap-6">
                        {[
                            { name: 'Home', href: '/' },
                            { name: 'Services', href: '/#Services', id: 'Services' },
                            { name: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
                            { name: 'Contact', href: '#contact', id: 'contact' },
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="font-heading text-[#2C3E50] text-3xl font-medium hover:text-[#D35400] transition-colors"
                                onClick={(e) => {
                                    setMobileMenuOpen(false);
                                    if (item.id) {
                                        const section = document.getElementById(item.id);
                                        if (section) {
                                            e.preventDefault();
                                            section.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    } else if (item.href === '/' && window.location.pathname === '/') {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                }}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Auth Button */}
                        <div className="mt-4 flex flex-col gap-4 items-center">
                            {client ? (
                                <>
                                    <Link
                                        href="/client/dashboard"
                                        className="px-8 py-3 rounded-full font-semibold text-lg bg-[#2C0E0F] text-[#DAA520] shadow-lg hover:bg-[#DAA520] hover:text-[#2C0E0F] transition-colors flex items-center gap-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={20} />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="px-8 py-3 rounded-full font-semibold text-lg bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={20} />
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/client/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-8 py-3 rounded-full font-semibold text-lg bg-[#D35400] text-white shadow-lg hover:bg-[#E67E22] transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            </header >

            <PujaModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
            />
        </>
    );
};

export default Header;
