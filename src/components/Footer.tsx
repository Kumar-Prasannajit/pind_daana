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
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.231-.298.347-.497.116-.198.058-.372-.029-.545-.087-.173-.767-1.85-.94-2.515-.198-.795-.47-.562-.644-.562-.172-.005-.371-.005-.569-.005-.224 0-.585.084-.891.417-.306.334-1.171 1.144-1.171 2.793 0 1.649 1.201 3.243 1.366 3.467.165.223 2.364 3.61 5.726 5.064 2.196.953 3.033.947 4.148.847 1.229-.11 2.534-1.036 2.891-2.036.357-1.001.357-1.859.25-2.036-.087-.198-.328-.297-.625-.446z M12 4.091c4.379 0 7.926 3.548 7.926 7.926-.002 1.484-.396 2.892-1.109 4.12l.067.118 1.18 4.309-4.417-1.159-.112.066C14.372 19.96 13.208 20.25 12 20.25c-4.378 0-7.926-3.547-7.926-7.926S7.621 4.091 12 4.091 M12 2C6.477 2 2 6.477 2 12c0 1.767.464 3.447 1.272 4.935L1.583 23.364l6.578-1.719C9.792 22.458 10.875 22.818 12 22.818c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
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
                    <p>&copy; {new Date().getFullYear()} Manima Services. All rights reserved. | Jai Jagannath</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
