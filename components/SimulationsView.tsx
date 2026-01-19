import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SimulatorCardProps {
    icon: string;
    title: string;
    description: string;
    gradient: string;
    onClick: () => void;
}

const SimulatorCard: React.FC<SimulatorCardProps> = ({ icon, title, description, gradient, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative group cursor-pointer"
        >
            <div className="relative h-full bg-white backdrop-blur-xl border border-gray-200 rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:border-gray-300 hover:shadow-2xl hover:shadow-gray-200">
                {/* Gradient Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`}></div>

                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                        <i className={`fas ${icon} text-3xl text-white`}></i>
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${gradient})` }}>
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-900 transition-colors">
                        <span className="text-sm font-bold uppercase tracking-wider">Abrir Simulador</span>
                        <i className="fas fa-arrow-right text-xs group-hover:translate-x-2 transition-transform"></i>
                    </div>
                </div>

                {/* Corner Accent */}
                <div className={`absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`}></div>
            </div>
        </motion.div>
    );
};

interface SimulationsViewProps {
    onNavigateToSimulator: (type: 'compound-interest' | 'reverse-dream' | 'fire') => void;
}

const SimulationsView: React.FC<SimulationsViewProps> = ({ onNavigateToSimulator }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-full mb-6 shadow-sm">
                        <i className="fas fa-flask text-[var(--primary)] text-xl"></i>
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-600">Laboratório</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl font-black text-gray-900 mb-4 tracking-tight">
                        Laboratório de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Futuro</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Veja como pequenas decisões hoje transformam sua vida amanhã.
                    </motion.p>
                </div>

                {/* Simulator Cards Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <SimulatorCard
                        icon="fa-chart-line"
                        title="Juros Compostos"
                        description="Visualize o poder dos juros compostos trabalhando para você. Pequenos aportes mensais se transformam em grandes fortunas."
                        gradient="from-emerald-500 to-teal-500"
                        onClick={() => onNavigateToSimulator('compound-interest')}
                    />

                    <SimulatorCard
                        icon="fa-bullseye"
                        title="Planejador de Sonhos"
                        description="Defina uma meta e descubra quanto precisa investir mensalmente para realizá-la. Planejamento reverso simplificado."
                        gradient="from-violet-500 to-fuchsia-500"
                        onClick={() => onNavigateToSimulator('reverse-dream')}
                    />

                    <SimulatorCard
                        icon="fa-fire"
                        title="Independência Financeira"
                        description="Calcule quando você pode parar de trabalhar. Descubra seu número FIRE e o caminho até sua liberdade."
                        gradient="from-orange-500 to-amber-500"
                        onClick={() => onNavigateToSimulator('fire')}
                    />
                </motion.div>

                {/* Bottom Accent */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                        <i className="fas fa-lightbulb"></i>
                        <span>Dica: Cada simulação pode ser transformada em uma meta real</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SimulationsView;
