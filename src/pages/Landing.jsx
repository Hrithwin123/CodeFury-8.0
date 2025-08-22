import React, { useState, useEffect } from 'react';
import { Heart, Users, Smartphone, MessageCircle, MapPin, Star, ChevronRight, Menu, X, Download, Play } from 'lucide-react';

const FarmSwipeLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Detect mobile device
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
      icon: <Heart className="w-6 h-6" />,
      title: "Swipe to Connect",
      description: "Discover fresh produce with a simple swipe"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Direct Chat",
      description: "Negotiate prices directly with farmers"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Local Discovery",
      description: "Find farmers near you instantly"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Quality Assured",
      description: "Verified farmers with ratings"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Organic Farmer",
      content: "Finally, I can sell directly to customers without losing profit to middlemen!",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Home Chef",
      content: "Fresh vegetables from local farms. Amazing quality and fair prices.",
      rating: 5
    },
    {
      name: "Ankit Patel",
      role: "Restaurant Owner",
      content: "Bulk ordering made simple. Direct sourcing from trusted farmers.",
      rating: 5
    }
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
                <span className="text-lg font-bold text-gray-800">FarmSwipe</span>
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
                <a href="#how-it-works" className="block py-2 text-gray-700 font-medium">How It Works</a>
                <a href="#testimonials" className="block py-2 text-gray-700 font-medium">Reviews</a>
                <a href="/auth" className="block py-2 text-gray-700 font-medium">Sign In</a>
                <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-400 text-white py-3 rounded-full font-semibold mt-2">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Hero Section */}
        <section className="px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
              Swipe Right for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-400">
                Fresh Produce
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Connect directly with local farmers and get the freshest produce delivered to your door.
            </p>
          </div>
          
          {/* Mobile Phone Mockup */}
          <div className="max-w-xs mx-auto mb-8">
            <div className="bg-white rounded-3xl shadow-2xl p-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm opacity-80">Fresh Organic Tomatoes</span>
                  <Heart className="w-5 h-5" />
                </div>
                <div className="w-full h-24 bg-white/20 rounded-xl mb-3 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop&crop=center" 
                    alt="Fresh tomatoes" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">₹40/kg</p>
                    <p className="text-xs opacity-80">Ramesh Farm</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile CTA Buttons */}
          <div className="space-y-3">
            <a href="/auth" className="w-full bg-gradient-to-r from-teal-600 to-cyan-400 text-white py-4 rounded-full text-lg font-semibold flex items-center justify-center shadow-lg">
              <Download className="mr-2 w-5 h-5" />
              Get Started
            </a>
            <button className="w-full border-2 border-teal-600 text-teal-600 py-4 rounded-full text-lg font-semibold flex items-center justify-center">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </section>

        {/* Mobile Features Section */}
        <section id="features" className="py-12 bg-white">
          <div className="px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Why Choose <span className="text-teal-600">FarmSwipe</span>?
              </h2>
              <p className="text-gray-600">Features designed for you</p>
            </div>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl flex items-start space-x-4"
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

        {/* Mobile How It Works Section */}
        <section id="how-it-works" className="py-12 bg-gradient-to-br from-cyan-50 to-teal-50">
          <div className="px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                How It <span className="text-teal-600">Works</span>
              </h2>
              <p className="text-gray-600">Simple steps to fresh produce</p>
            </div>
            
            <div className="space-y-6">
              {[
                { step: "01", title: "Discover", desc: "Browse local farmers and fresh produce" },
                { step: "02", title: "Swipe", desc: "Swipe right on products you love" },
                { step: "03", title: "Connect", desc: "Chat with farmers and arrange delivery" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Testimonials Section */}
        <section id="testimonials" className="py-12 bg-white">
          <div className="px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                What Our <span className="text-teal-600">Community</span> Says
              </h2>
            </div>
            
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl"
                >
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-3 text-sm italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{testimonial.name}</p>
                    <p className="text-teal-600 text-sm">{testimonial.role}</p>
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
              Ready to Transform Agriculture?
            </h2>
            <p className="text-white/90 mb-6">
              Join thousands building a sustainable food ecosystem
            </p>
            <div className="space-y-3">
              <button className="w-full bg-white text-teal-600 py-4 rounded-full text-lg font-semibold">
                Download App
              </button>
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
                <span className="text-lg font-bold">FarmSwipe</span>
              </div>
              <p className="text-gray-400 text-sm">Connecting farmers and consumers for a sustainable future.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Product</h3>
                <ul className="space-y-1 text-gray-400">
                  <li><a href="#">Features</a></li>
                  <li><a href="#">How It Works</a></li>
                  <li><a href="#">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Support</h3>
                <ul className="space-y-1 text-gray-400">
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Contact Us</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-400 text-xs">
              <p>&copy; 2025 FarmSwipe. All rights reserved.</p>
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
              <span className="text-2xl font-bold text-gray-800">FarmSwipe</span>
            </div>
            
            {/* Desktop Menu */}
                          <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-teal-600 transition-colors">How It Works</a>
                <a href="#testimonials" className="text-gray-700 hover:text-teal-600 transition-colors">Reviews</a>
                <a href="/auth" className="text-gray-700 hover:text-teal-600 transition-colors">Sign In</a>
                <button className="bg-gradient-to-r from-teal-600 to-cyan-400 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  Get Started
                </button>
              </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-700">How It Works</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700">Reviews</a>
              <button className="w-full mt-2 bg-gradient-to-r from-teal-600 to-cyan-400 text-white px-6 py-2 rounded-full">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
                Swipe Right for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-400">
                  Fresh Produce
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect directly with local farmers, negotiate fair prices, and get the freshest produce delivered to your door. No middlemen, just genuine farm-to-table connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/auth" className="bg-gradient-to-r from-teal-600 to-cyan-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                  Start Swiping
                  <ChevronRight className="ml-2 w-5 h-5" />
                </a>
                <button className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-50 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm mx-auto">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl p-6 text-white mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm opacity-80">Fresh Organic Tomatoes</span>
                      <Heart className="w-6 h-6" />
                    </div>
                    <div className="w-full h-32 bg-white/20 rounded-xl mb-4 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop&crop=center" 
                        alt="Fresh organic tomatoes" 
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1607305488809-25d4912ccc93?w=400&h=300&fit=crop&crop=center";
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">₹40/kg</p>
                        <p className="text-sm opacity-80">Ramesh Farm</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                          <X className="w-6 h-6" />
                        </button>
                        <button className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                          <Heart className="w-6 h-6 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background produce images */}
                <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full overflow-hidden opacity-30 animate-bounce">
                  <img 
                    src="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&h=100&fit=crop&crop=center" 
                    alt="Fresh vegetables" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full overflow-hidden opacity-30 animate-pulse">
                  <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&crop=center" 
                    alt="Fresh fruits" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Why Choose <span className="text-teal-600">FarmSwipe</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary features designed to bridge the gap between farmers and consumers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              How It <span className="text-teal-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600">Simple steps to fresh produce</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Discover", 
                desc: "Browse local farmers and their fresh produce", 
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop&crop=center"
              },
              { 
                step: "02", 
                title: "Swipe", 
                desc: "Swipe right on products you love, left to skip", 
                image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=200&fit=crop&crop=center"
              },
              { 
                step: "03", 
                title: "Connect", 
                desc: "Chat directly with farmers and arrange delivery", 
                image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200&h=200&fit=crop&crop=center"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{item.title}</h3>
                <p className="text-gray-600 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              What Our <span className="text-teal-600">Community</span> Says
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-teal-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Agriculture?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and consumers who are already building a more sustainable food ecosystem
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Download App
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
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
                <span className="text-2xl font-bold">FarmSwipe</span>
              </div>
              <p className="text-gray-400">Connecting farmers and consumers for a sustainable future.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FarmSwipe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FarmSwipeLanding;