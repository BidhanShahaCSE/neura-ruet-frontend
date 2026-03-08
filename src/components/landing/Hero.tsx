import { motion } from 'framer-motion';
import { HiDownload } from 'react-icons/hi';
import { FaAndroid, FaApple, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PhoneMockup from './PhoneMockup';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon/[0.03] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your RUET{' '}
              <span className="block">Life,</span>
              <span className="text-gradient block">Augmented by</span>
              <span className="text-gradient block">AI.</span>
            </h1>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon/10 border border-neon/20 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              <span className="text-xs text-neon font-medium">RUET Intelligence at your service</span>
            </motion.div>

            {/* Description */}
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              The ultimate AI assistant designed exclusively for RUET students and teachers. Access materials, manage schedules, and get instant answers tailored to your courses.
            </p>

            {/* Platform pills */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <div className="inline-flex items-center gap-4">
                <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-neon/10 border border-neon/20">
                  <FaAndroid className="text-neon text-lg" />
                  <span className="text-sm text-white/90 font-semibold">Android</span>
                </span>
                <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-neon/10 border border-neon/20">
                  <FaApple className="text-neon text-lg" />
                  <span className="text-sm text-white/90 font-semibold">iOS</span>
                </span>
                <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-neon/10 border border-neon/20">
                  <FaGlobe className="text-neon text-lg" />
                  <span className="text-sm text-white/90 font-semibold">Web</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="flex justify-center lg:justify-end"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
