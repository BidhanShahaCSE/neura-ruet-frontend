import { motion } from 'framer-motion';
import {
    HiSearch,
    HiDocumentText,
    HiClipboardCheck,
    HiBell,
    HiUpload,
    HiUserGroup,
    HiAcademicCap,
    HiTable,
} from 'react-icons/hi';
const roles = [
    {
        title: 'For Students',
        subtitle: 'AI tools designed to simplify your academic life.',
        icon: HiAcademicCap,
        accent: 'border-neon/10',
        bg: '',
        features: [
            { icon: HiSearch, label: 'Smart Material Finder', desc: 'Find slides, notes, CT questions instantly', ai: true },
            { icon: HiDocumentText, label: 'AI Cover Page Generator', desc: 'Generate professional academic cover pages instantly', ai: true },
            { icon: HiClipboardCheck, label: 'CT Marks Checker', desc: 'View marks published by teachers', ai: true },
            { icon: HiBell, label: 'Notice Viewer', desc: 'See official notices from teachers & CRs', ai: true },
        ],
    },
    {
        title: 'For Class Representatives',
        subtitle: 'Manage and assist your class efficiently with smart tools.',
        icon: HiUserGroup,
        accent: 'border-neon/20',
        bg: 'bg-gradient-to-br from-neon/[0.04] to-emerald-500/[0.02]',
        highlighted: true,
        features: [
            { icon: HiUpload, label: 'Upload Study Materials', desc: 'Share slides, notes & resources with your class' },
            { icon: HiBell, label: 'Upload Notices', desc: 'Post important announcements for your section' },
            { icon: HiAcademicCap, label: 'Access All Student AI Tools', desc: 'Full access to every student feature', ai: true },
        ],
    },
    {
        title: 'For Teachers',
        subtitle: 'Simplify academic management with AI assistance.',
        icon: HiAcademicCap,
        accent: 'border-neon/10',
        bg: '',
        features: [
            { icon: HiTable, label: 'AI Marksheet Generator', desc: 'Auto generate structured marksheets', ai: true },
            { icon: HiSearch, label: 'Smart Material Finder', desc: 'Locate academic resources instantly', ai: true },
            { icon: HiUpload, label: 'Upload Results', desc: 'Publish CT marks for students' },
            { icon: HiBell, label: 'Upload Notices', desc: 'Send announcements to students & CRs' },
        ],
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
};

const RoleFeatures = () => {
    return (
        <section id="role-features" className="relative py-24 md:py-32 overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-neon/[0.06] rounded-full blur-[180px] animate-glow-pulse pointer-events-none" />

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
                        Role-Based AI Tools &{' '}
                        <span className="text-gradient">Features</span>
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Tailored experiences for every campus role — students, class representatives, and teachers — all powered by AI.
                    </p>
                </motion.div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {roles.map((role, index) => (
                        <motion.div
                            key={role.title}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative flex w-full max-w-md mx-auto lg:max-w-none"
                        >
                            {/* Card border glow on hover */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon/0 to-neon/0 group-hover:from-neon/20 group-hover:to-emerald-500/20 rounded-2xl blur transition-all duration-500 opacity-0 group-hover:opacity-100" />

                            <div
                                className={`relative glass rounded-2xl p-6 md:p-8 w-full flex flex-col glass-hover cursor-default border ${role.accent} ${role.bg}`}
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-neon/20 to-emerald-500/10 flex items-center justify-center ${role.highlighted ? 'shadow-neon' : ''} group-hover:shadow-neon transition-all duration-300`}>
                                        <role.icon className="text-neon text-lg" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white group-hover:text-neon transition-colors duration-300">
                                        {role.title}
                                    </h3>
                                </div>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                    {role.subtitle}
                                </p>

                                {/* Feature List */}
                                <ul className="space-y-4 flex-1">
                                    {role.features.map((feat) => (
                                        <li key={feat.label} className="flex items-start gap-3">
                                            <span
                                                className={`mt-0.5 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                                                    feat.ai
                                                        ? 'bg-neon/15 text-neon'
                                                        : 'bg-white/5 text-gray-400'
                                                }`}
                                            >
                                                <feat.icon className="text-sm" />
                                            </span>
                                            <div>
                                                <span className="text-white text-sm font-medium leading-none flex items-center gap-1.5">
                                                    {feat.label}
                                                    {feat.ai && (
                                                        <span className="text-[10px] font-semibold text-neon bg-neon/10 px-1.5 py-0.5 rounded-full leading-none">
                                                            AI
                                                        </span>
                                                    )}
                                                </span>
                                                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                                                    {feat.desc}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Highlighted badge for CR card */}
                                {role.highlighted && (
                                    <div className="mt-6 pt-4 border-t border-neon/10">
                                        <span className="text-xs text-neon/70 font-medium">
                                            ✦ Includes all Student features plus management tools
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RoleFeatures;
