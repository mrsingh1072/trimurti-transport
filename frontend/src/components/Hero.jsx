import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'

export default function Hero({ onGetStarted }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  }

  return (
    <section className="pt-40 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div 
        className="glow-blob-purple w-96 h-96 top-10 -left-48"
        animate={{ 
          y: [0, 30, 0],
          x: [0, 20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ animation: 'none' }}
      />
      <motion.div 
        className="glow-blob-cyan w-80 h-80 top-1/3 -right-40"
        animate={{ 
          y: [0, -30, 0],
          x: [0, -20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        style={{ animation: 'none' }}
      />

      <div className="container-max relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-block mb-8">
            <div className="glass px-4 py-3 flex items-center gap-2 mx-auto w-fit hover:bg-white/10 transition-colors">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <span className="text-2xl">⭐</span>
              </motion.div>
              <span className="text-sm text-gray-300">Trusted by 10,000+ premium customers</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text">Luxury Vehicle Rental</span>
            {' '}<br />
            <motion.span 
              className="text-white block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Reimagined for Excellence
            </motion.span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience the future of premium car rentals. AI-powered matching, transparent pricing, and white-glove service for discerning travelers and businesses.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20">
            <motion.button 
              onClick={onGetStarted}
              className="btn-primary btn-lg flex items-center gap-2 group w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight size={20} />
              </motion.span>
            </motion.button>
            <motion.button 
              className="btn-secondary btn-lg flex items-center gap-2 group w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play size={20} fill="currentColor" />
              </motion.div>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Hero Dashboard Preview with Glow */}
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            {/* Glow Effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 blur-3xl -z-10"
              animate={{ 
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Glass Card */}
            <motion.div 
              className="glass p-6 md:p-10 overflow-hidden"
              whileHover={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated Grid Background */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5" />

              <div className="relative z-10">
                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: 'Active Rentals', value: '2,847', icon: '🚗' },
                    { label: 'Revenue', value: '$1.2M', icon: '💰' },
                    { label: 'Satisfaction', value: '98.5%', icon: '⭐' },
                    { label: 'Growth', value: '+156%', icon: '📈' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      className="text-center group p-4 rounded-xl hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.4 }}
                    >
                      <motion.div 
                        className="text-3xl md:text-4xl mb-2 flex justify-center"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                      >
                        {stat.icon}
                      </motion.div>
                      <p className="text-gray-500 text-xs md:text-sm mb-1">{stat.label}</p>
                      <p className="gradient-text text-xl md:text-2xl font-bold">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Bar Animation */}
                <motion.div 
                  className="mt-8 pt-6 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">System Performance</span>
                    <span className="text-sm font-semibold gradient-text">98%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: '98%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
