import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCampaigns } from '../store/campaignSlice';
import CampaignCard from '../components/CampaignCard';
import { Search, TrendingUp, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

function Home() {
  const dispatch = useDispatch();
  const { campaigns, loading } = useSelector((state) => state.campaigns);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && campaign.status === 'active';
    if (filter === 'successful') return matchesSearch && campaign.status === 'successful';
    if (filter === 'trending') return matchesSearch && campaign.progress_percentage > 50;
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen relative">
      <ThreeBackground />
      {/* Hero Section */}
      <div className="relative z-10 border-b border-white/10 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-bold mb-6"
            >
              Projects looking for backers
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto"
            >
              Search, filter and back a campaign from your wallet.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <Link to="/register" className="text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all shadow-sm shadow-primary-500/30 bg-primary-600">
                Get Started
              </Link>
              <Link to="/create-campaign" className="border-2 border-white/30 bg-white/10 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all">
                Start a Campaign
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 bg-white/5 py-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-primary-400 mb-2">
                {campaigns.length}
              </div>
              <div className="text-gray-300">Total Campaigns</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-green-400 mb-2">
                {campaigns.filter(c => c.status === 'successful').length}
              </div>
              <div className="text-gray-300">Successful Projects</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">
                ${campaigns.reduce((sum, c) => sum + (c.total_pledged || 0), 0).toLocaleString()}
              </div>
              <div className="text-gray-300">Total Funded</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'active'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Active</span>
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'trending'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </button>
              <button
                onClick={() => setFilter('successful')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'successful'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Successful</span>
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-300">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <img src="/illustrations/cf-empty-projects.webp" alt="" width="180" height="120" className="mx-auto mb-4 h-auto w-[180px] invert opacity-80" />
            <div className="mx-auto mb-4 w-48 rounded-xl bg-[#f7f4ec] p-3"><img src="/illustrations/cf-empty-projects.webp" alt="" width={240} height={171} className="mx-auto h-auto w-40" /></div>
            <p className="text-gray-300 text-lg">No campaigns match this search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
