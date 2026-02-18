
"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import PujaModal from './PujaModal';
import Loader from './Loader';
import CouponStack from './CouponStack';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [openPujaModal, setOpenPujaModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    const isAdminRoute = pathname?.startsWith('/admin');
    const isDashboardRoute = pathname?.startsWith('/client/dashboard');
    const isAgentRoute = pathname?.startsWith('/agent');
    const isLoginRoute = pathname?.startsWith('/client/login');
    const isSignupRoute = pathname?.startsWith('/client/signup');
    const isForgotPasswordRoute = pathname?.startsWith('/client/forgot-password');
    const isVerifyOtpRoute = pathname?.startsWith('/client/verify-otp');
    const isCheckoutRoute = pathname?.startsWith('/checkout');
    const isCountdownRoute = pathname?.startsWith('/countdown');

    // For these routes, we don't want the global Header/Footer/Loader
    if (isAdminRoute || isDashboardRoute || isAgentRoute || isLoginRoute || isSignupRoute || isForgotPasswordRoute || isVerifyOtpRoute || isCheckoutRoute || isCountdownRoute) {
        return <div className="app">{children}</div>;
    }

    return (
        <div className="app">
            <Loader onLoaded={() => setLoading(false)} />

            {/* Content fades in or just appears after loader */}
            <div className={`transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <Header onOpenPuja={() => setOpenPujaModal(true)} />

                <main>
                    {children}
                </main>

                <Footer onOpenPuja={() => setOpenPujaModal(true)} />
            </div>

            <PujaModal
                isOpen={openPujaModal}
                onClose={() => setOpenPujaModal(false)}
            />

            {/* GLOBAL COUPON NOTIFICATIONS */}
            <CouponStack />
        </div>
    );
};

export default MainLayout;
