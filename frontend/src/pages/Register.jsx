import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../store/authSlice';
import { Rocket, User, Mail, Lock, ArrowLeft, Briefcase, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthCarousel from '../components/AuthCarousel';

const art = (n) => `/illustrations/${n}.webp`;
const SHARED_SLIDES = [
  { src: art('cf-carousel-create'), caption: 'Start a campaign with a goal, a deadline and a short story.' },
  { src: art('cf-carousel-back'), caption: 'Back the projects you care about, straight from your wallet.' },
  { src: art('cf-carousel-wallet'), caption: 'Your wallet shows every pledge and refund in one place.' },
];
const SLIDES = {
  login: [{ src: art('cf-auth-signin'), caption: 'Welcome back. See how your projects are growing.' }, ...SHARED_SLIDES],
  register: [{ src: art('cf-auth-signup'), caption: 'Plant an idea and let people help it grow.' }, ...SHARED_SLIDES],
};


function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'investor',
  });

  const roles = [
    {
      value: 'investor',
      label: 'Investor',
      icon: TrendingUp,
      description: 'Back innovative projects and earn returns',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'entrepreneur',
      label: 'Entrepreneur',
      icon: Briefcase,
      description: 'Create campaigns and raise funds',
      color: 'from-purple-500 to-pink-500'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Manage platform and oversee operations',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen bg-[#151915] lg:grid lg:h-screen lg:grid-cols-2 lg:overflow-hidden">
      <aside className="hidden min-h-0 flex-col justify-between bg-[#f7f4ec] p-10 lg:flex">
        <Link to="/landing" className="text-2xl font-semibold text-[#23201a]">FundStarter</Link>
        <AuthCarousel slides={SLIDES.register} />
      </aside>
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:min-h-0 lg:overflow-y-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        
        
        
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full relative z-10"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-300 hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm shadow-primary-500/50 bg-primary-600">
              <Rocket className="w-9 h-9 text-white" />
            </div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Create Account
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300"
          >
            Join FundStarter and start your journey
          </motion.p>
        </div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 rounded-2xl p-8 shadow-sm border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Choose Your Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((roleOption) => {
                  const Icon = roleOption.icon;
                  return (
                    <motion.button
                      key={roleOption.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, role: roleOption.value })}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        formData.role === roleOption.value
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className={`w-12 h-12 rounded-lg bg-primary-600 ${roleOption.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{roleOption.label}</div>
                          <div className="text-xs text-gray-400 mt-1">{roleOption.description}</div>
                        </div>
                      </div>
                      {formData.role === roleOption.value && (
                        <motion.div
                          layoutId="roleSelector"
                          className="absolute inset-0 border-2 border-primary-500 rounded-xl"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {(error || localError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error || localError}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 text-white rounded-lg font-semibold transition-all shadow-sm shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}

export default Register;
