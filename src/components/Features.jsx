import { motion } from 'framer-motion';
import { HiSearch, HiBell, HiUser } from 'react-icons/hi';

const features = [
    {
        icon: HiSearch,
        title: 'AI-Powered Academic Intelligence',
        description: 'Advanced AI models process and organize university data to provide structured, accurate academic support.',
        color: 'from-neon/20 to-emerald-500/10',
    },
    {
        icon: HiBell,
        title: 'Instant Notifications',
        description: 'Stay updated with real-time alerts about class cancellations, rescheduled CTs, and important departmental notices.',
        color: 'from-neon/20 to-cyan-500/10',
    },
    {
        icon: HiUser,
        title: 'Profile Management',
        description: 'Customized experience based on your role (Student, Teacher, or CR), department, series, and section.',
        color: 'from-neon/20 to-violet-500/10',
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.15,
            duration: 0.6,
            ease: 'easeOut',
        },
    }),
};

const Features = () => {
    return (
        <section id="features" className="relative py-24 md:py-32">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon/5 rounded-full blur-[150px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        Intelligent Features for{' '}
                        <span className="text-gradient block sm:inline">Smarter Learning</span>
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Everything you need to navigate your academic life at RUET, powered by advanced AI and tailored to your specific department and section.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative w-full max-w-md mx-auto sm:max-w-none"
                        >
                            {/* Card Glow on Hover */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon/0 to-neon/0 group-hover:from-neon/20 group-hover:to-emerald-500/20 rounded-2xl blur transition-all duration-500 opacity-0 group-hover:opacity-100" />

                            <div className="relative glass rounded-2xl p-6 md:p-8 h-full glass-hover cursor-default">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:shadow-neon transition-all duration-300`}>
                                    <feature.icon className="text-neon text-xl" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-neon transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
