import { motion } from 'framer-motion';
import { HiDownload } from 'react-icons/hi';
import { FaApple } from 'react-icons/fa';

const APK_LINK = '/NeuraRUET.apk';
const APPSTORE_LINK = '#';

const RoleCTA = () => {
    return (
        <section id="role-cta" className="relative py-24 md:py-32 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 glow-bg" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-neon/20 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-neon/20 to-transparent" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Ready to Experience{' '}
                        <span className="text-gradient">AI-Powered</span>
                        <span className="block">Campus Life?</span>
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                        Join thousands of RUET students and teachers already using NeuraRUET to supercharge their academic workflow.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.a
                            href={APK_LINK}
                            download
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 px-6 py-3.5 bg-neon text-dark font-semibold rounded-full hover:bg-neon-dark hover:shadow-neon-md transition-all duration-300 group"
                        >
                            <HiDownload className="text-xl" />
                            <div className="text-left">
                                <span className="text-[10px] text-dark/70 block leading-none">Download for</span>
                                <span className="text-sm font-semibold">Android APK</span>
                            </div>
                        </motion.a>

                        <motion.a
                            href={APPSTORE_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-neon/30 hover:shadow-neon transition-all duration-300 group"
                        >
                            <FaApple className="text-xl text-neon" />
                            <div className="text-left">
                                <span className="text-[10px] text-gray-400 block leading-none">Download on the</span>
                                <span className="text-sm font-semibold text-white group-hover:text-neon transition-colors">App Store</span>
                            </div>
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default RoleCTA;
