import React, { useState, useEffect } from 'react';
import { Heart, Users, Smartphone, MessageCircle, MapPin, ChevronRight, Menu, X, Download, Play, Zap, Shield, TrendingUp, Clock, Bot, DollarSign, Truck, BarChart3 } from 'lucide-react';

const HarvestLinkLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeRole, setActiveRole] = useState('farmer');

  useEffect(() => {
    setIsVisible(true);
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword)) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI-Powered Pricing",
      description: "AI suggests fair market prices to prevent exploitation"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-time Bidding",
      description: "Live auction system for produce and equipment"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Razorpay integration with advanced security"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location-based",
      description: "Connect with farmers and buyers in your area"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Direct Communication",
      description: "Chat directly with buyers and sellers"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Market Insights",
      description: "Real-time analytics and market trends"
    }
  ];

  const roles = [
    {
      id: 'farmer',
      title: 'Farmers',
      icon: <Users className="w-8 h-8" />,
             benefits: [
         'List produce with AI-suggested market prices',
        'Set auction parameters and starting bids',
        'Direct sales without middlemen markup',
        'Real-time market insights and trends',
        'Secure payment processing'
      ]
    },
    {
      id: 'distributor',
      title: 'Distributors',
      icon: <Truck className="w-8 h-8" />,
      benefits: [
        'Browse fresh produce from verified farmers',
        'Participate in live bidding auctions',
        'Bulk ordering with negotiated prices',
        'Track bidding history and analytics',
        'Direct farmer communication'
      ]
    },
    {
      id: 'equipment',
      title: 'Equipment Sellers',
      icon: <Zap className="w-8 h-8" />,
      benefits: [
        'List agricultural equipment and machinery',
        'Create time-based auction sessions',
        'Manage equipment inventory efficiently',
        'Track bidding activity in real-time',
        'Secure transaction processing'
      ]
    }
  ];



  const stats = [
    { number: "500+", label: "Active Users" },
    { number: "₹10L+", label: "Transaction Volume" },
    { number: "95%", label: "Payment Success Rate" },
    { number: "24/7", label: "Platform Availability" }
  ];

  // Mobile-optimized component
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
        {/* Mobile Navigation */}
        <nav className="bg-white/95 backdrop-blur-md border-b border-teal-100 sticky top-0 z-50">
          <div className="px-4">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                                 <span className="text-lg font-bold text-gray-800">HarvestLink</span>
              </div>
              
              <button 
                className="p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="space-y-3">
                <a href="#features" className="block py-2 text-gray-700 font-medium">Features</a>
                <a href="#roles" className="block py-2 text-gray-700 font-medium">For You</a>

                <a href="/auth" className="block py-2 text-gray-700 font-medium">Sign In</a>
                <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-400 text-white py-3 rounded-full font-semibold mt-2">
                  Start Selling
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Hero Section */}
        <section className="px-4 py-12">
          <div className="text-center mb-8">
                         <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
               Next-Generation
               <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-400">
                 Agriculture Platform
               </span>
             </h1>
             <p className="text-lg text-gray-600 mb-6">
                Advanced AI-powered marketplace revolutionizing agricultural commerce with intelligent pricing and enterprise-grade security.
              </p>
          </div>
          
          {/* Mobile Dashboard Mockup */}
          <div className="max-w-xs mx-auto mb-8">
            <div className="bg-white rounded-3xl shadow-2xl p-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm opacity-80">Fresh Organic Tomatoes</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Live Auction</span>
                  </div>
                </div>
                <div className="w-full h-24 bg-white/20 rounded-xl mb-3 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop&crop=center" 
                    alt="Fresh tomatoes" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold">₹42/kg</p>
                    <p className="opacity-80">Current Bid: ₹38/kg</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-80">5 Bidders</p>
                    <p className="font-semibold text-orange-300">2h 15m left</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.slice(0, 4).map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mobile CTA Buttons */}
          <div className="space-y-3">
            <a href="/auth" className="w-full bg-gradient-to-r from-teal-600 to-cyan-400 text-white py-4 rounded-full text-lg font-semibold flex items-center justify-center shadow-lg">
              <Download className="mr-2 w-5 h-5" />
              Start Selling
            </a>
            <button className="w-full border-2 border-teal-600 text-teal-600 py-4 rounded-full text-lg font-semibold flex items-center justify-center">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </section>

        {/* Mobile Role Selection */}
        <section id="roles" className="py-12 bg-white">
          <div className="px-4">
            <div className="text-center mb-8">
                           <h2 className="text-3xl font-bold text-gray-800 mb-3">
               Built for <span className="text-teal-600">Every Role</span>
             </h2>
             <p className="text-gray-600">Discover specialized solutions designed to maximize your success in the agricultural ecosystem</p>
            </div>
            
            {/* Role Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeRole === role.id 
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-400 text-white' 
                      : 'text-gray-600'
                  }`}
                >
                  {role.title}
                </button>
              ))}
            </div>

            {/* Active Role Benefits */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center text-white mr-3">
                  {roles.find(r => r.id === activeRole)?.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  For {roles.find(r => r.id === activeRole)?.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {roles.find(r => r.id === activeRole)?.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Mobile Features Section */}
        <section id="features" className="py-12 bg-gradient-to-br from-cyan-50 to-teal-50">
          <div className="px-4">
            <div className="text-center mb-8">
                           <h2 className="text-3xl font-bold text-gray-800 mb-3">
               Revolutionary <span className="text-teal-600">Features</span>
             </h2>
             <p className="text-gray-600">State-of-the-art technology for next-generation agriculture</p>
            </div>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-md flex items-start space-x-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Mobile CTA Section */}
        <section className="py-12 bg-gradient-to-r from-teal-600 to-cyan-400">
          <div className="px-4 text-center">
                         <h2 className="text-3xl font-bold text-white mb-4">
               Revolutionize Your Agricultural Operations
             </h2>
             <p className="text-white/90 mb-6">
                Join the elite network of forward-thinking agricultural professionals
              </p>
            <div className="space-y-3">
                             <a href="/auth" className="block w-full bg-white text-teal-600 py-4 rounded-full text-lg font-semibold">
                 Join HarvestLink
               </a>
              <button className="w-full border-2 border-white text-white py-4 rounded-full text-lg font-semibold">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="px-4">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                                 <span className="text-lg font-bold">HarvestLink</span>
              </div>
                                          <p className="text-gray-400 text-sm">Next-generation agriculture marketplace platform</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Platform</h3>
                <ul className="space-y-1 text-gray-400">
                  <li><a href="#features">Features</a></li>
                  <li><a href="#roles">For Farmers</a></li>
                  <li><a href="#roles">For Distributors</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Support</h3>
                <ul className="space-y-1 text-gray-400">
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">API Docs</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-400 text-xs">
                             <p>&copy; 2025 HarvestLink. Built with ❤️ for the agricultural community</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
                               <span className="text-2xl font-bold text-gray-800">HarvestLink</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors">Features</a>
              <a href="#roles" className="text-gray-700 hover:text-teal-600 transition-colors">Solutions</a>

              <a href="/auth" className="text-gray-700 hover:text-teal-600 transition-colors">Sign In</a>
              <button className="bg-gradient-to-r from-teal-600 to-cyan-400 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                Start Selling
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                             <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-md">
                 <TrendingUp className="w-4 h-4 text-teal-600 mr-2" />
                 <span className="text-sm font-medium text-gray-700">Live Bidding Platform</span>
               </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
                Next-Generation
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-400">
                  Agriculture Platform
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The most advanced, AI-powered marketplace revolutionizing agricultural commerce. Experience seamless bidding, intelligent pricing, and enterprise-grade security for the modern farming ecosystem.
              </p>
              
              {/* Hero Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/auth" className="bg-gradient-to-r from-teal-600 to-cyan-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                  Join Marketplace
                  <ChevronRight className="ml-2 w-5 h-5" />
                </a>
                <button className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Dashboard Mockup */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-800">Live Auctions</h3>
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Auction Item 1 */}
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-400 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm opacity-90">Organic Tomatoes - 500kg</span>
                                                 <div className="flex items-center space-x-1">
                           <TrendingUp className="w-4 h-4" />
                           <span className="text-xs">Live Auction</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="opacity-80">Current Bid</p>
                          <p className="font-bold text-lg">₹42/kg</p>
                        </div>
                        <div className="text-right">
                          <p className="opacity-80">Time Left</p>
                          <p className="font-bold text-orange-300">2h 15m</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Auction Item 2 */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-700">Tractor Auction</span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Equipment</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Bid</p>
                          <p className="font-bold text-gray-800">₹8.5L</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Bidders</p>
                          <p className="font-bold text-teal-600">12</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white animate-bounce">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white animate-pulse">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
               Revolutionary <span className="text-teal-600">Platform Features</span>
             </h2>
             <p className="text-xl text-gray-600 max-w-4xl mx-auto">
               Engineered with state-of-the-art technology to deliver unprecedented efficiency, reliability, and innovation in agricultural commerce
             </p>
           </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-br from-cyan-50 to-teal-50 p-8 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-teal-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Solutions Section */}
      <section id="roles" className="py-20 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
               Comprehensive <span className="text-teal-600">Solutions</span> for Every Role
             </h2>
             <p className="text-xl text-gray-600">Specialized, purpose-built features designed to maximize efficiency and profitability for every participant in the agricultural value chain</p>
           </div>
          
          {/* Role Selector */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeRole === role.id 
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-400 text-white shadow-md' 
                      : 'text-gray-600 hover:text-teal-600'
                  }`}
                >
                  {role.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Content */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center text-white mr-4">
                    {roles.find(r => r.id === activeRole)?.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800">
                      For {roles.find(r => r.id === activeRole)?.title}
                    </h3>
                    <p className="text-teal-600 font-medium">Maximize your potential</p>
                  </div>
                </div>
                
                <ul className="space-y-4">
                  {roles.find(r => r.id === activeRole)?.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-3 h-3 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                      <span className="text-gray-700 text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <a href="/auth" className="bg-gradient-to-r from-teal-600 to-cyan-400 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center">
                    Get Started as {roles.find(r => r.id === activeRole)?.title.slice(0, -1)}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div className="relative">
                {/* Role-specific mockup */}
                {activeRole === 'farmer' && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Farmer Dashboard Preview</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-700">Tomatoes (500kg)</span>
                        <span className="text-green-600 font-semibold">₹42/kg</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-700">Onions (200kg)</span>
                        <span className="text-blue-600 font-semibold">Live Auction</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-700">Potatoes (1000kg)</span>
                        <span className="text-orange-600 font-semibold">₹25/kg</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeRole === 'distributor' && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Distributor Dashboard Preview</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700">Fresh Tomatoes</span>
                          <span className="text-red-600 font-semibold">2h left</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Your bid: ₹40/kg</span>
                          <span>Leading: ₹42/kg</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Equipment Auction</span>
                          <span className="text-green-600 font-semibold">Won</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeRole === 'equipment' && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Equipment Seller Dashboard</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700">Tractor - John Deere</span>
                          <span className="text-green-600 font-semibold">₹8.5L</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>12 bidders</span>
                          <span>Ends in 4h</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Harvester Listing</span>
                          <span className="text-blue-600 font-semibold">Draft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

             {/* Enterprise Technology Stack Section */}
       <section className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
               Enterprise-Grade <span className="text-teal-600">Technology Stack</span>
             </h2>
             <p className="text-xl text-gray-600 max-w-4xl mx-auto">
               Built on cutting-edge, enterprise-ready infrastructure with military-grade security, real-time scalability, and industry-leading performance metrics
             </p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { 
                 name: "React 19 + Vite", 
                 desc: "Next-generation frontend with lightning-fast HMR and optimized bundle splitting", 
                 specs: "99.9% Uptime • <100ms Load Time",
                 color: "from-blue-500 to-cyan-500" 
               },
               { 
                 name: "Flask + Gunicorn", 
                 desc: "High-performance Python backend with async processing and load balancing", 
                 specs: "10K+ RPS • Auto-scaling • Zero-downtime",
                 color: "from-purple-500 to-pink-500" 
               },
               { 
                 name: "Supabase Enterprise", 
                 desc: "Real-time PostgreSQL with advanced encryption and automated backups", 
                 specs: "99.99% SLA • End-to-end encryption • Real-time sync",
                 color: "from-green-500 to-emerald-500" 
               },
               { 
                 name: "Razorpay Pro", 
                 desc: "PCI DSS Level 1 certified payment gateway with fraud detection", 
                 specs: "256-bit SSL • 99.9% Success Rate • Instant settlements",
                 color: "from-indigo-500 to-blue-500" 
               }
             ].map((tech, index) => (
               <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 group">
                 <div className={`w-16 h-16 bg-gradient-to-br ${tech.color} rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                   <Zap className="w-8 h-8 text-white" />
                 </div>
                 <h4 className="font-bold text-gray-800 mb-3 text-lg">{tech.name}</h4>
                 <p className="text-gray-600 mb-4 text-sm leading-relaxed">{tech.desc}</p>
                 <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-3 py-2 rounded-lg">
                   <p className="text-xs font-semibold text-teal-700">{tech.specs}</p>
                 </div>
               </div>
             ))}
           </div>
           
           {/* Additional Enterprise Features */}
           <div className="mt-16 grid md:grid-cols-3 gap-8">
             <div className="text-center">
               <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                 <Shield className="w-8 h-8 text-white" />
               </div>
               <h4 className="font-bold text-gray-800 mb-2">Enterprise Security</h4>
               <p className="text-gray-600 text-sm">SOC 2 Type II certified • GDPR compliant • Multi-factor authentication</p>
             </div>
             <div className="text-center">
               <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                 <TrendingUp className="w-8 h-8 text-white" />
               </div>
               <h4 className="font-bold text-gray-800 mb-2">Global Infrastructure</h4>
               <p className="text-gray-600 text-sm">Multi-region deployment • CDN optimization • 99.99% uptime SLA</p>
             </div>
             <div className="text-center">
               <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                 <BarChart3 className="w-8 h-8 text-white" />
               </div>
               <h4 className="font-bold text-gray-800 mb-2">Advanced Analytics</h4>
               <p className="text-gray-600 text-sm">Real-time monitoring • Predictive insights • Performance optimization</p>
             </div>
           </div>
         </div>
       </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                     <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
             Ready to Revolutionize Your
             <span className="block">Agricultural Operations?</span>
           </h2>
           <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto">
             Join the elite network of forward-thinking agricultural professionals who are already leveraging our advanced platform to achieve unprecedented growth, efficiency, and profitability
           </p>
          
          {/* CTA Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                         {[
               { value: "Zero", label: "Commission Fees" },
               { value: "Live", label: "Bidding" },
               { value: "24/7", label: "Support" },
               { value: "Secure", label: "Payments" }
             ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-white">{item.value}</div>
                <div className="text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth" className="bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center">
              <Download className="mr-2 w-5 h-5" />
                             Join HarvestLink Now
            </a>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center">
              <Play className="mr-2 w-5 h-5" />
              Watch Platform Demo
            </button>
          </div>
          
                                <p className="text-white/70 mt-6 text-sm">
             Enterprise-grade infrastructure • Global CDN optimization • Real-time bidding platform • 99.99% uptime guarantee
           </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                                 <span className="text-2xl font-bold">HarvestLink</span>
              </div>
                             <p className="text-gray-400 mb-4">Next-generation agriculture marketplace platform revolutionizing the entire agricultural ecosystem with cutting-edge technology and intelligent solutions.</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors cursor-pointer">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">For Farmers</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">For Distributors</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Equipment Sales</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Technology</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Pricing API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bidding System</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Payment Gateway</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Real-time Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                                    <p>&copy; 2025 HarvestLink. Engineered with precision for the agricultural community. Powered by enterprise-grade technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HarvestLinkLanding;