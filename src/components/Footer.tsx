import React from 'react';
// import './Footer.css'; // Removed custom CSS
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const WhatsappIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.073-1.117l-.292-.174-3.037.863.844-3.135-.19-.303A7.95 7.95 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.884c-.242-.121-1.43-.706-1.651-.786-.222-.08-.383-.121-.545.121-.161.242-.626.786-.768.948-.141.162-.282.182-.524.061-.242-.121-1.022-.377-1.947-1.201-.719-.641-1.205-1.433-1.346-1.675-.141-.242-.015-.373.106-.493.109-.109.242-.283.363-.425.12-.141.161-.242.242-.403.08-.162.04-.303-.02-.425-.061-.121-.545-1.313-.747-1.797-.196-.473-.396-.409-.545-.417l-.464-.008c-.161 0-.424.06-.646.303-.222.242-.848.829-.848 2.022 0 1.192.868 2.344.989 2.506.12.161 1.708 2.608 4.139 3.656.579.25 1.03.399 1.381.511.58.185 1.109.159 1.527.096.466-.07 1.43-.585 1.632-1.149.201-.565.201-1.049.141-1.149-.06-.101-.222-.162-.464-.283z" />
    </svg>
);
interface FooterProps {
    onOpenPuja?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenPuja }) => {
    return (
        <footer className="bg-[#fffbf2] text-[#5c4d44] pt-20 text-[0.95rem]" id="contact">
            <div className="container mx-auto px-6 flex flex-wrap justify-between gap-12 pb-16">
                <div className="flex-1 min-w-[250px]">
                    <div className="mb-6">
                        <Image src="/assets/manima_logo.png" alt="Manima" width={180} height={60} className="h-[60px] w-auto" unoptimized />
                    </div>
                    <p className="text-[#7f6e63] leading-relaxed mb-6">
                        Connecting the Odia diaspora with their roots. Perform sacred rituals with authenticity and devotion, no matter where you are.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://www.facebook.com/share/1DfYP7Ga9p/" className="flex text-[#D35400] bg-[#D35400]/10 p-2 rounded-full transition-all hover:bg-[#D35400] hover:text-white hover:-translate-y-[3px]"><Facebook size={20} /></a>
                        <a href="https://www.instagram.com/manima.app?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="flex text-[#D35400] bg-[#D35400]/10 p-2 rounded-full transition-all hover:bg-[#D35400] hover:text-white hover:-translate-y-[3px]"><Instagram size={20} /></a>
                        <a href="https://wa.me/918280638830?text=Hi%21%20I%20would%20like%20to%20book%20a%20puja%20service." className="flex text-[#D35400] bg-[#D35400]/10 p-2 rounded-full transition-all hover:bg-[#D35400] hover:text-white hover:-translate-y-[3px]"><WhatsappIcon size={20} /></a>
                    </div>
                </div>

                <div className="flex-1 min-w-[250px]">
                    <h4 className="text-[#2c0e0e] text-xl mb-6 relative inline-block font-bold">Quick Links</h4>
                    <ul className="list-none">
                        {[
                            { name: 'Home', href: '/' },
                            { name: 'About Us', href: '/about-us' },
                            { name: 'Ritual Packages', href: '/pujas' },
                            // { name: 'FAQs', href: '#faq' },
                            { name: 'Privacy Policy', href: '/privacy-policy' },
                            { name: 'Terms & Conditions', href: '/terms-conditions' },
                            { name: 'Agent Login', href: '/agent/login' }
                        ].map((link) => (
                            <li key={link.name} className="mb-3">
                                <Link
                                    className="pb-[4px] relative group transition-colors hover:text-[#D35400]"
                                    href={link.href}
                                >
                                    {link.name}
                                    <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[#D35400] transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex-1 min-w-[250px]">
                    <h4 className="text-[#2c0e0e] text-xl mb-6 relative inline-block font-bold">Contact Us</h4>
                    <ul className="list-none">
                        <li className="flex items-start gap-3 mb-4">
                            <Phone size={18} className="text-[#D35400]" /> <span>+91 8280638830</span> <span>+91 9668198230</span>
                        </li>
                        <li className="flex items-start gap-3 mb-4">
                            <Mail size={18} className="text-[#D35400]" /> <span>manima.app@gmail.com</span>
                        </li>
                        <li className="flex items-start gap-3 mb-4">
                            <MapPin size={18} className="text-[#D35400] mt-1 shrink-0" />
                            <div className="flex flex-col">
                                <a href="https://navgyaninnovations.com/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#E67E22] transition-colors">
                                    Navgyan Innovations Pvt Ltd
                                </a>
                                <span>Nilachakra Nagar, Gunupur, Rayagada, Odisha, India, 765022</span>
                            </div>
                        </li>
                    </ul>
                    <button
                        className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 rounded-[4px] font-semibold transition-all duration-300 uppercase tracking-[0.05em] bg-[#D35400] text-white shadow-sm hover:bg-[#E67E22] hover:-translate-y-0.5 hover:shadow-md animate-bounce"
                        onClick={onOpenPuja}
                    >
                        Request Puja Assistance
                    </button>

                </div>
            </div>
            <div className="bg-[#D35400]/5 py-6 text-center text-[#8d7a6f] text-[0.85rem] border-t border-[#D35400]/10">
                <div className="container mx-auto px-6 flex justify-end items-center">
                    <p>&copy; {new Date().getFullYear()} Manima Online, a product of Navgyan Innovations Pvt Ltd. All rights reserved. | Jai Jagannath</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
