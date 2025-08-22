import React, { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, MapPin, User, ShoppingCart, Clock, Leaf, Filter, ArrowLeft } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';

// Add CSS to hide scrollbars globally for this component
const hideScrollbarStyles = `
  .swipe-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .swipe-container::-webkit-scrollbar {
    display: none;
  }
`;

const Swipe = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [likedItems, setLikedItems] = useState([]);
  const [passedItems, setPassedItems] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Motion values for drag interaction
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-25, 25]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0]);
  
  // Enhanced feedback transforms
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);
  const scale = useTransform(x, [-300, 0, 300], [0.85, 1, 0.85]);

  // Check user authentication and role on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // Get user role from metadata
          const role = user.user_metadata?.user_role || 'consumer';
          setUserRole(role);
        } else {
          // Redirect to auth if not logged in
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Error checking user:', error);
        window.location.href = '/auth';
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Consumer data (produce listings)
  const allProduceData = [
    {
      id: 1,
      name: "Organic Heirloom Tomatoes",
      price: "₹45/kg",
      farm: "Ramesh Organic Farm",
      location: "Pune, Maharashtra",
      rating: 4.8,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=500&fit=crop&crop=center",
      description: "Premium heirloom tomatoes with rich flavor, grown using sustainable farming practices. Perfect for gourmet cooking.",
      category: "Vegetables",
      harvestDate: "Today",
      quantity: "50kg available",
      certifications: ["Organic", "Pesticide-free"],
      freshness: 100,
      tags: ["premium", "heirloom", "sustainable"]
    },
    {
      id: 2,
      name: "Sweet Baby Corn",
      price: "₹30/kg",
      farm: "Green Valley Cooperative",
      location: "Nashik, Maharashtra",
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=500&fit=crop&crop=center",
      description: "Tender baby corn, harvested at peak sweetness. Excellent for stir-fries and grilling.",
      category: "Grains",
      harvestDate: "Yesterday",
      quantity: "100kg available",
      certifications: ["Non-GMO"],
      freshness: 95,
      tags: ["sweet", "tender", "versatile"]
    },
    {
      id: 3,
      name: "Baby Spinach Leaves",
      price: "₹35/kg",
      farm: "Urban Harvest Co.",
      location: "Mumbai, Maharashtra",
      rating: 4.9,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=500&fit=crop&crop=center",
      description: "Nutrient-dense baby spinach, perfect for salads and smoothies. Grown using hydroponic methods.",
      category: "Leafy Greens",
      harvestDate: "Today",
      quantity: "25kg available",
      certifications: ["Organic", "Hydroponic"],
      freshness: 100,
      tags: ["nutrient-rich", "hydroponic", "baby-greens"]
    },
    {
      id: 4,
      name: "Rainbow Carrots",
      price: "₹40/kg",
      farm: "Sunshine Sustainable Farms",
      location: "Aurangabad, Maharashtra",
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=500&fit=crop&crop=center",
      description: "Colorful heritage carrots in purple, orange, and yellow. Rich in antioxidants and perfect for creative dishes.",
      category: "Root Vegetables",
      harvestDate: "2 days ago",
      quantity: "75kg available",
      certifications: ["Heirloom", "Organic"],
      freshness: 90,
      tags: ["colorful", "heritage", "antioxidants"]
    },
    {
      id: 5,
      name: "Tri-Color Bell Peppers",
      price: "₹55/kg",
      farm: "Rainbow Gardens",
      location: "Kolhapur, Maharashtra",
      rating: 4.5,
      reviews: 94,
      image: "https://images.unsplash.com/photo-1525609004558-c46e7aedc0e5?w=400&h=500&fit=crop&crop=center",
      description: "Premium mix of red, yellow, and green bell peppers. Sweet, crisp, and perfect for any cuisine.",
      category: "Vegetables",
      harvestDate: "Today",
      quantity: "40kg available",
      certifications: ["Pesticide-free"],
      freshness: 100,
      tags: ["colorful", "sweet", "premium"]
    },
    {
      id: 6,
      name: "Fresh Basil Bunch",
      price: "₹20/bunch",
      farm: "Herb Heaven",
      location: "Lonavala, Maharashtra",
      rating: 4.8,
      reviews: 78,
      image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&h=500&fit=crop&crop=center",
      description: "Aromatic fresh basil, hand-picked daily. Perfect for pasta, pizza, and Mediterranean dishes.",
      category: "Herbs",
      harvestDate: "Today",
      quantity: "200 bunches available",
      certifications: ["Organic"],
      freshness: 100,
      tags: ["aromatic", "mediterranean", "premium"]
         }
   ];

   // Farmer data (farming tools and equipment)
   const allFarmingToolsData = [
     {
       id: 1,
       name: "Premium Garden Hoe Set",
       price: "₹2,500",
       brand: "FarmPro Tools",
       location: "Pune, Maharashtra",
       rating: 4.8,
       reviews: 156,
       image: "https://images.unsplash.com/photo-1581578731548-cf97ba7328e9?w=400&h=500&fit=crop&crop=center",
       description: "Professional grade garden hoe set with ergonomic handles. Perfect for soil preparation and weeding.",
       category: "Hand Tools",
       condition: "New",
       quantity: "15 sets available",
       warranty: "2 years",
       material: "Stainless Steel",
       tags: ["premium", "ergonomic", "durable"]
     },
     {
       id: 2,
       name: "Solar-Powered Irrigation System",
       price: "₹45,000",
       brand: "GreenTech Solutions",
       location: "Mumbai, Maharashtra",
       rating: 4.9,
       reviews: 89,
       image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&crop=center",
       description: "Smart irrigation system with solar panels, automated scheduling, and soil moisture sensors.",
       category: "Irrigation",
       condition: "New",
       quantity: "8 systems available",
       warranty: "5 years",
       power: "Solar + Battery",
       tags: ["smart", "solar", "automated"]
     },
     {
       id: 3,
       name: "Organic Fertilizer Mixer",
       price: "₹18,000",
       brand: "Organic Farm Equipment",
       location: "Nashik, Maharashtra",
       rating: 4.7,
       reviews: 203,
       image: "https://images.unsplash.com/photo-1581578731548-cf97ba7328e9?w=400&h=500&fit=crop&crop=center",
       description: "Industrial-grade mixer for creating custom organic fertilizer blends. Stainless steel construction.",
       category: "Fertilizer Equipment",
       condition: "New",
       quantity: "12 units available",
       warranty: "3 years",
       capacity: "500kg batch",
       tags: ["organic", "industrial", "stainless"]
     },
     {
       id: 4,
       name: "Portable Greenhouse Kit",
       price: "₹32,000",
       brand: "GrowTech",
       location: "Aurangabad, Maharashtra",
       rating: 4.6,
       reviews: 127,
       image: "https://images.unsplash.com/photo-1581578731548-cf97ba7328e9?w=400&h=500&fit=crop&crop=center",
       description: "Modular greenhouse kit with UV-resistant cover and aluminum frame. Easy assembly and maintenance.",
       category: "Greenhouse",
       condition: "New",
       quantity: "20 kits available",
       warranty: "2 years",
       size: "6m x 4m",
       tags: ["modular", "portable", "uv-resistant"]
     },
     {
       id: 5,
       name: "Precision Seed Drill",
       price: "₹28,000",
       brand: "Precision Farming Co.",
       location: "Kolhapur, Maharashtra",
       rating: 4.8,
       reviews: 94,
       image: "https://images.unsplash.com/photo-1581578731548-cf97ba7328e9?w=400&h=500&fit=crop&crop=center",
       description: "Advanced seed drill with depth control and spacing adjustment. Perfect for row crops and vegetables.",
       category: "Planting Equipment",
       condition: "New",
       quantity: "10 units available",
       warranty: "3 years",
       rowSpacing: "Adjustable",
       tags: ["precision", "adjustable", "efficient"]
     },
     {
       id: 6,
       name: "Harvesting Shears Set",
       price: "₹3,500",
       brand: "Harvest Master",
       location: "Lonavala, Maharashtra",
       rating: 4.9,
       reviews: 178,
       image: "https://images.unsplash.com/photo-1581578731548-cf97ba7328e9?w=400&h=500&fit=crop&crop=center",
       description: "Professional harvesting shears set with multiple blade types for different crops and harvesting needs.",
       category: "Harvesting Tools",
       condition: "New",
       quantity: "25 sets available",
       warranty: "1 year",
       bladeTypes: "5 different types",
       tags: ["professional", "versatile", "sharp"]
     }
   ];

   // Select data based on user role
   const allData = userRole === 'farmer' ? allFarmingToolsData : allProduceData;
      const categories = userRole === 'farmer' 
     ? ['all', 'Hand Tools', 'Irrigation', 'Fertilizer Equipment', 'Greenhouse', 'Planting Equipment', 'Harvesting Tools']
     : ['all', 'Vegetables', 'Grains', 'Leafy Greens', 'Root Vegetables', 'Herbs'];

   // Filter data based on category
   const filteredData = useMemo(() => {
     if (filterCategory === 'all') return allData;
     return allData.filter(item => {
       if (userRole === 'farmer') {
         // Filter farming tools by category
         return item.category?.toLowerCase().includes(filterCategory.toLowerCase());
       } else {
         // Filter produce by category
         return item.category?.toLowerCase().includes(filterCategory.toLowerCase());
       }
     });
   }, [filterCategory, allData, userRole]);

  // Reset motion values when card changes
  useEffect(() => {
    x.set(0);
    y.set(0);
  }, [currentIndex]);

  // Generate consistent random values for card positioning
  const getCardTransform = (index) => {
    const seed = index * 7;
    const rotation = ((seed % 10) - 5) * 0.8;
    const xOffset = ((seed % 20) - 10) * 0.6;
    const yOffset = (index - currentIndex) * 12 + Math.sin(seed) * 3;
    const scaleValue = Math.max(0.85 - (index - currentIndex) * 0.03, 0.75);
    
    return {
      rotate: `${rotation}deg`,
      translateX: `${xOffset}px`,
      translateY: `${yOffset}px`,
      scale: scaleValue
    };
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 120;
    const swipeVelocityThreshold = 500;
    
    const isSwipe = Math.abs(info.offset.x) > swipeThreshold || 
                   Math.abs(info.velocity.x) > swipeVelocityThreshold;
    
    if (isSwipe) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      
      const exitX = direction === 'right' ? 500 : -500;
      x.set(exitX);
      
      setTimeout(() => {
        handleSwipe(direction);
      }, 150);
    } else {
      x.set(0);
      y.set(0);
    }
  };

     const handleSwipe = (direction) => {
     const currentItem = filteredData[currentIndex];
     
     if (direction === 'right') {
       setLikedItems(prev => [...prev, currentItem]);
     } else {
       setPassedItems(prev => [...prev, currentItem]);
     }
     
     setTimeout(() => {
       setCurrentIndex((prev) => (prev + 1) % filteredData.length);
       setSwipeDirection(null);
     }, 100);
   };

  const handleButtonSwipe = (direction) => {
    setSwipeDirection(direction);
    const exitX = direction === 'right' ? 500 : -500;
    x.set(exitX);
    handleSwipe(direction);
  };

     const currentItem = filteredData[currentIndex];
   const visibleCards = filteredData.slice(currentIndex, currentIndex + 4);

  const resetAndGoBack = () => {
    setCurrentIndex(0);
    setShowMatches(false);
    setLikedItems([]);
    setPassedItems([]);
  };

     // Show loading while checking authentication
   if (loading) {
     return (
       <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
         <div className="text-center">
           <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Leaf className="w-8 h-8 text-white animate-pulse" />
           </div>
           <p className="text-emerald-600 font-medium">Loading FarmSwipe...</p>
         </div>
       </div>
     );
   }

   if (showMatches) {
     return <MatchesView likedItems={likedItems} userRole={userRole} onBack={() => setShowMatches(false)} onReset={resetAndGoBack} />;
   }

  return (
    <>
      <style>{hideScrollbarStyles}</style>
      <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col overflow-hidden swipe-container">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-emerald-200/50 z-50 shadow-sm flex-shrink-0">
        <div className="max-w-md mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
                             <div>
                 <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                   FarmSwipe
                 </span>
                 <p className="text-xs text-gray-500">
                   {userRole === 'farmer' ? 'Tools • Equipment • Innovation' : 'Fresh • Local • Sustainable'}
                 </p>
               </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMatches(true)}
                className="relative bg-emerald-100 hover:bg-emerald-200 p-2 rounded-xl transition-colors"
              >
                <Heart className="w-4 h-4 text-emerald-600" />
                {likedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {likedItems.length}
                  </span>
                )}
              </button>
                             <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                 {currentIndex + 1} / {filteredData.length}
               </span>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="mt-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setFilterCategory(category);
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filterCategory === category
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Stack Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="relative w-full max-w-sm h-[520px]">
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card, stackIndex) => {
              const actualIndex = currentIndex + stackIndex;
              const isTopCard = stackIndex === 0;
              const transform = getCardTransform(actualIndex);

              return (
                <motion.div
                  key={card.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: 10 - stackIndex,
                    ...(!isTopCard && {
                      transform: `rotate(${transform.rotate}) translateX(${transform.translateX}) translateY(${transform.translateY}) scale(${transform.scale})`
                    })
                  }}
                  initial={{ 
                    scale: 0.9, 
                    opacity: 0,
                    y: 50
                  }}
                  animate={{ 
                    scale: isTopCard ? 1 : transform.scale, 
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                    x: swipeDirection === 'right' ? 400 : swipeDirection === 'left' ? -400 : 0,
                    rotate: swipeDirection === 'right' ? 20 : swipeDirection === 'left' ? -20 : 0,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                >
                  {isTopCard ? (
                    <motion.div
                      className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                      drag="x"
                      dragConstraints={{ left: -300, right: 300 }}
                      dragElastic={0.2}
                      dragMomentum={false}
                      onDragEnd={handleDragEnd}
                      style={{ x, y, rotate, scale }}
                      whileDrag={{ 
                        scale: 1.02,
                        rotateZ: 5,
                        transition: { type: "spring", stiffness: 400, damping: 25 }
                      }}
                    >
                                             <EnhancedCardContent card={card} userRole={userRole} />
                       
                       {/* Swipe Feedback Overlays */}
                      <motion.div
                        className="absolute top-8 right-8 pointer-events-none"
                        style={{ opacity: likeOpacity }}
                      >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl transform rotate-12 border-4 border-white">
                          ❤️ LOVE IT
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute top-8 left-8 pointer-events-none"
                        style={{ opacity: nopeOpacity }}
                      >
                        <div className="bg-gradient-to-r from-red-500 to-pink-400 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl transform -rotate-12 border-4 border-white">
                          ❌ PASS
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                                         <div className="w-full h-full bg-white rounded-3xl shadow-lg overflow-hidden opacity-70">
                       <EnhancedCardContent card={card} userRole={userRole} />
                     </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-emerald-200/50 shadow-lg flex-shrink-0">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            <motion.button
              onClick={() => handleButtonSwipe('left')}
              className="w-14 h-14 bg-white border-4 border-red-400 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <X className="w-7 h-7 text-red-400" />
            </motion.button>
            
            <motion.button
              onClick={() => handleButtonSwipe('right')}
              className="w-18 h-18 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Heart className="w-9 h-9 text-white" />
            </motion.button>
          </div>
          
                     <p className="text-center text-xs text-gray-500 mt-3">
             {userRole === 'farmer' 
               ? 'Swipe right to add to cart • Swipe left to pass'
               : 'Swipe right to add to cart • Swipe left to pass'
             }
           </p>
        </div>
      </div>
    </div>
      </>
  );
};

// Enhanced Card Content Component
const EnhancedCardContent = ({ card, userRole }) => (
  <>
         {/* Image Section with Badges */}
     <div className="relative h-4/6 overflow-hidden">
       <img
         src={card.image}
         alt={card.name}
         className="w-full h-full object-cover"
         draggable="false"
       />
       
                {/* Role-specific badges */}
         {userRole === 'farmer' ? (
           // Farming tools badges
           <>
             <div className="absolute top-4 left-4">
               <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                 {card.condition}
               </div>
             </div>
             <div className="absolute top-4 right-4">
               <div className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500 text-white">
                 {card.warranty}
               </div>
             </div>
           </>
         ) : (
         // Produce badges
         <>
           <div className="absolute top-4 left-4">
             <div className={`px-3 py-1 rounded-full text-xs font-bold ${
               card.freshness >= 95 ? 'bg-green-500 text-white' : 
               card.freshness >= 85 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
             }`}>
               {card.freshness}% Fresh
             </div>
           </div>
           <div className="absolute top-4 right-4 flex flex-col gap-1">
             {card.certifications?.map((cert, index) => (
               <div key={index} className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                 {cert}
               </div>
             ))}
           </div>
         </>
       )}
      
             {/* Gradient Overlay */}
       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
         <div className="text-white">
           <div className="flex items-start justify-between mb-3">
             <div>
               <h2 className="text-2xl font-bold mb-1">{card.name}</h2>
               <div className="flex items-center space-x-3">
                 <div className="flex items-center space-x-1">
                   <Star className="w-4 h-4 fill-current text-yellow-400" />
                   <span className="text-sm font-medium">{card.rating}</span>
                   <span className="text-xs opacity-75">
                     {userRole === 'farmer' ? `(${card.orders} orders)` : `(${card.reviews} reviews)`}
                   </span>
                 </div>
               </div>
             </div>
                            <div className="text-right">
                 {userRole === 'farmer' ? (
                   <>
                     <p className="text-3xl font-bold text-blue-300">{card.price}</p>
                     <p className="text-xs opacity-75">{card.quantity}</p>
                   </>
                 ) : (
                   <>
                     <p className="text-3xl font-bold text-emerald-300">{card.price}</p>
                     <p className="text-xs opacity-75">{card.quantity}</p>
                   </>
                 )}
               </div>
           </div>
           
                        <div className="flex items-center space-x-2 text-sm opacity-90">
               <MapPin className="w-4 h-4" />
               <span>
                 {userRole === 'farmer' ? `${card.brand} • ${card.location}` : `${card.farm} • ${card.location}`}
               </span>
             </div>
         </div>
       </div>
    </div>

    {/* Enhanced Info Section */}
    <div className="p-6 h-2/6 flex flex-col justify-between">
      <div>
                 <div className="flex items-center justify-between mb-3">
           <div className="flex items-center space-x-2 text-gray-600">
             <Clock className="w-4 h-4" />
             <span className="text-sm font-medium">
               {userRole === 'farmer' ? `Warranty: ${card.warranty}` : `Harvested: ${card.harvestDate}`}
             </span>
           </div>
           <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
             {userRole === 'farmer' ? card.category : card.category}
           </span>
         </div>
        
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {card.description}
        </p>
        
                 {/* Role-specific tags */}
         {userRole === 'farmer' ? (
           // Farming tools tags
           card.tags && (
             <div className="flex flex-wrap gap-1 mb-3">
               {card.tags.map((tag, index) => (
                 <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                   {tag}
                 </span>
               ))}
             </div>
           )
         ) : (
          // Produce tags
          card.tags && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  </>
);

// Matches View Component
const MatchesView = ({ likedItems, userRole, onBack, onReset }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
    <div className="bg-white/95 backdrop-blur-lg border-b border-emerald-200/50 z-50 sticky top-0">
      <div className="max-w-md mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
                             <h1 className="text-xl font-bold text-gray-800">
                 {userRole === 'farmer' ? 'Your Cart' : 'Your Cart'}
               </h1>
               <p className="text-sm text-gray-500">
                 {userRole === 'farmer' ? `${likedItems.length} tools selected` : `${likedItems.length} items selected`}
               </p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
    
    <div className="max-w-md mx-auto p-6">
      {likedItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
                     <h2 className="text-xl font-semibold text-gray-800 mb-2">
             {userRole === 'farmer' ? 'No tools yet' : 'No items yet'}
           </h2>
           <p className="text-gray-500 mb-6">
             {userRole === 'farmer' 
               ? 'Start swiping to add farming tools to your cart!' 
               : 'Start swiping to add fresh produce to your cart!'
             }
           </p>
                     <button
             onClick={onBack}
             className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
           >
             {userRole === 'farmer' ? 'Start Shopping' : 'Start Shopping'}
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          {likedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-lg flex items-center space-x-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-xl"
              />
                             <div className="flex-1">
                 <h3 className="font-semibold text-gray-800">{item.name}</h3>
                 <p className="text-sm text-gray-500">
                   {userRole === 'farmer' ? item.brand : item.farm}
                 </p>
                 <div className="flex items-center justify-between mt-1">
                   <span className="text-emerald-600 font-bold">{item.price}</span>
                   <span className="text-xs text-gray-400">{item.quantity}</span>
                 </div>
               </div>
            </motion.div>
          ))}
          
          <div className="bg-white rounded-2xl p-6 shadow-lg mt-6">
                                      <div className="flex items-center justify-between mb-4">
               <span className="text-lg font-semibold">
                 {userRole === 'farmer' ? 'Total Tools:' : 'Total Items:'}
               </span>
               <span className="text-lg font-bold text-emerald-600">{likedItems.length}</span>
             </div>
             <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all">
               {userRole === 'farmer' ? 'Proceed to Checkout' : 'Proceed to Checkout'}
             </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Swipe;