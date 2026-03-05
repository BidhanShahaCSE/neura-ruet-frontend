import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'AI Tools', href: '#role-features' },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e, href) => {
        e.preventDefault();
        const wasOpen = isOpen;
        setIsOpen(false);
        const scroll = () => {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        };
        if (wasOpen) {
            setTimeout(scroll, 350);
        } else {
            scroll();
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-dark/80 backdrop-blur-xl border-b border-white/5 shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2 group">
                        <span className="text-xl md:text-2xl font-bold text-white">
                            Neura<span className="text-neon">RUET</span>
                        </span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon rounded-full group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                        <a
                            href="#role-cta"
                            onClick={(e) => handleNavClick(e, '#role-cta')}
                            className="px-5 py-2 bg-neon text-dark font-semibold text-sm rounded-full hover:bg-neon-dark hover:shadow-neon transition-all duration-300"
                        >
                            Download App
                        </a>
                    </div>

                    {/* Mobile actions: download pill + toggle */}
                    <div className="md:hidden flex items-center gap-3">
                        <a
                            href="#role-cta"
                            onClick={(e) => handleNavClick(e, '#role-cta')}
                            className="px-3 py-1.5 bg-neon text-dark font-semibold text-sm rounded-full hover:bg-neon-dark hover:shadow-neon transition-all duration-300"
                        >
                            Download
                        </a>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white text-2xl p-2"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <HiX /> : <HiMenuAlt3 />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden bg-dark-200/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-4 flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className="text-gray-300 hover:text-neon py-2 px-3 rounded-lg hover:bg-white/5 transition-all duration-200"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <a
                                href="#role-cta"
                                onClick={(e) => handleNavClick(e, '#role-cta')}
                                className="mt-2 px-5 py-2.5 bg-neon text-dark font-semibold text-sm rounded-full text-center hover:bg-neon-dark transition-all duration-300"
                            >
                                Download App
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
