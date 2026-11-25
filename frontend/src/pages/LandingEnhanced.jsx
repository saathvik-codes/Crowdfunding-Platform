import { Link } from 'react-router-dom';
import { Rocket, TrendingUp, Shield, Users, Zap, Heart, Target, Award, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';
import { useEffect, useState } from 'react';
import { campaignsAPI } from '../services/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

function LandingEnhanced() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Pledges you can trust',
      description: 'Every pledge is written in a single database transaction, so money is never counted twice.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Deadlines handled for you',
      description: 'When a campaign ends, its pledges are released or returned automatically.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'A view for each role',
      description: 'Creators, backers and admins each get their own dashboard.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Target,
      title: 'Campaign numbers',
      description: 'Pledges, backers and progress for every campaign, updated as they come in.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const [live, setLive] = useState(null);
  useEffect(() => {
    campaignsAPI.getAll()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.campaigns || data.data || [];
        setLive({
          campaigns: list.length,
          raised: list.reduce((sum, c) => sum + Number(c.total_pledged || 0), 0),
          backers: list.reduce((sum, c) => sum + Number(c.backers_count || 0), 0),
          funded: list.filter((c) => Number(c.total_pledged || 0) >= Number(c.goal_amount || c.goal || Infinity)).length,
        });
      })
      .catch(() => setLive(null));
  }, []);
  const show = (n, money) => (live ? (money ? '$' : '') + Math.round(n).toLocaleString() : '-');
  const stats = !live ? [] : [
    { value: show(live?.campaigns), label: 'Campaigns', icon: Rocket },
    { value: show(live?.raised, true), label: 'Pledged so far', icon: TrendingUp },
    { value: show(live?.backers), label: 'Backers', icon: Users },
    { value: show(live?.funded), label: 'Fully funded', icon: Award }
  ];

  const campaigns = [
    {
      title: 'Smart Home Revolution',
      category: 'Technology',
      raised: 85000,
      goal: 100000,
      backers: 1250,
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop'
    },
    {
      title: 'Eco-Friendly Fashion',
      category: 'Fashion',
      raised: 45000,
      goal: 50000,
      backers: 890,
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop'
    },
    {
      title: 'Community Garden Project',
      category: 'Community',
      raised: 28000,
      goal: 30000,
      backers: 450,
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop'
    }
  ];

  const roles = [
    {
      title: 'For Investors',
      icon: TrendingUp,
      description: 'Find projects you care about, back them from your wallet and follow their progress.',
      features: ['Portfolio Dashboard', 'Investment Analytics', 'Real-time Updates', 'Secure Wallet'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'For Entrepreneurs',
      icon: Rocket,
      description: 'Set up a campaign, share the link and see who backs it.',
      features: ['Campaign Management', 'Backer Analytics', 'Fund Tracking', 'Campaign page'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'For Admins',
      icon: Shield,
      description: 'Review campaigns and users, and keep the platform tidy.',
      features: ['User Management', 'Platform Analytics', 'Audit Logs', 'Platform numbers'],
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#151915]">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 bg-gray-900/80 border-b border-white/10 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shadow-primary-500/50 bg-primary-600">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                FundStarter
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 text-gray-300 hover:text-primary-400 font-medium transition-colors"
              >
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-6 py-2 text-white rounded-lg transition-all shadow-sm shadow-primary-500/30 font-medium bg-primary-600"
                >
                  Sign Up
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl lg:text-7xl font-bold text-white leading-tight"
              >
                Fund small projects,
                <span className="block text-white">together.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-300 leading-relaxed"
              >
                Start a campaign, share it and follow every pledge in one place. Backers pay from a wallet, and creators can see exactly who backed them.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-white rounded-xl transition-all shadow-sm shadow-primary-500/30 font-semibold text-lg group bg-primary-600"
                  >
                    Start Your Campaign
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all shadow-sm border border-white/20 font-semibold text-lg"
                  >
                    Explore Projects
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex items-center space-x-8 pt-4"
              >
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <img
                src="/illustrations/cf-hero-seedling.webp"
                alt="A seedling growing from a stack of coins while two hands water it"
                width="800" height="457"
                className="relative h-auto w-full invert hue-rotate-180 opacity-90"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && <section className="py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-primary-600">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>}

      {/* Role-Based Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              One platform, three roles
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              What each kind of account can do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="bg-gray-800/50 rounded-2xl p-8 border border-white/10 hover:border-primary-500/50 transition-all group"
                >
                  <div className={`w-16 h-16 bg-primary-600 ${role.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {role.description}
                  </p>
                  <ul className="space-y-3">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-400">
                        <CheckCircle className="w-5 h-5 text-primary-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Under the hood
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A relational database with transactions, views and triggers keeps the numbers consistent
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-800/50 rounded-2xl p-8 border border-white/10 hover:border-primary-500/50 transition-all group"
                >
                  <div className={`w-14 h-14 bg-primary-600 ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-12 border border-white/10"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Have an idea worth funding?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Setting up a campaign takes a few minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-white rounded-xl transition-all shadow-sm shadow-primary-500/30 font-semibold text-lg group bg-primary-600"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-white/10 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-600">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FundStarter</span>
              </div>
              <p className="text-sm text-gray-400">
                Crowdfunding for small projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FundStarter. All rights reserved. Built with advanced DBMS technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingEnhanced;
