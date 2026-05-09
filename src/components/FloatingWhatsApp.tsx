"use client";
import React from "react";

const FloatingWhatsApp = () => {
  // Replace with the actual WhatsApp number you want to use
  const phoneNumber = "919999999999"; 
  const defaultMessage = "Hi! I would like to know more about your rituals and services.";
  
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z" />
        <path d="M12.031 2C6.495 2 2 6.494 2 12.031c0 1.766.455 3.491 1.326 5.01L2 22l5.105-1.312C8.583 21.523 10.285 22 12.031 22 17.568 22 22 17.568 22 12.031S17.568 2 12.031 2zm0 18.36c-1.464 0-2.895-.386-4.148-1.116l-.297-.174-3.082.793.805-2.966-.192-.3A8.344 8.344 0 0 1 3.633 12.03c0-4.632 3.769-8.401 8.4-8.401 4.63 0 8.4 3.769 8.4 8.401s-3.77 8.4-8.4 8.331z" />
      </svg>
      {/* Tooltip on hover */}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-sm px-3 py-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap font-medium">
        Chat with us!
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
