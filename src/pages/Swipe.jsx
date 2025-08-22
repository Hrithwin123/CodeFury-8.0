import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useAnimation } from 'framer-motion';
import { Heart, X, Star, MapPin, ShoppingCart, Clock, Leaf, ArrowLeft } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';

// CSS to hide scrollbars and optimize rendering
const styles = `
  .swipe-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
    overscroll-behavior: none;
    touch-action: pan-y;
  }
  .swipe-container::-webkit-scrollbar {
    display: none;
  }
  .card {
    will-change: transform, opacity;
    transform-origin: center;
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
  const [produceData, setProduceData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Reduced ranges for faster animations
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15]);
  const opacity = useTransform(x, [-150, -75, 0, 75, 150], [0, 0.8, 1, 0.8, 0]);
  const likeOpacity = useTransform(x, [10, 75], [0, 1]);
  const nopeOpacity = useTransform(x, [-75, -10], [1, 0]);
  const scale = useTransform(x, [-150, 0, 150], [0.98, 1, 0.98]);

  // Check user authentication and role on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const role = user.user_metadata?.user_role || 'consumer';
          setUserRole(role);
          
          // Fetch produce data from database
          await fetchProduceData();
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Fetch produce data from database
  const fetchProduceData = async () => {
    try {
      const { data, error } = await supabase
        .from('active_produce_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match the expected format
      const transformedData = data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        farm: item.farm_name || 'Local Farm',
        location: item.location,
        rating: item.rating || 0,
        reviews: item.reviews_count || 0,
        image: item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=500&fit=crop&crop=center',
        description: item.description,
        category: item.category,
        harvestDate: item.harvest_date || 'Recently',
        quantity: item.quantity,
        certifications: item.certifications || [],
        freshness: item.freshness || 100,
        tags: item.tags || []
      }));
      
      setProduceData(transformedData);
    } catch (error) {
      console.error('Error fetching produce data:', error);
      // Fallback to sample data if database fails
      setProduceData([
        {
          id: 1,
          name: "Organic Heirloom Tomatoes",
          price: "₹45/kg",
          farm: "Ramesh Organic Farm",
          location: "Pune, Maharashtra",
          rating: 4.8,
          reviews: 127,
          image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=500&fit=crop&crop=center",
          description: "Premium heirloom tomatoes with rich flavor, grown using sustainable farming practices.",
          category: "Vegetables",
          harvestDate: "Today",
          quantity: "50kg available",
          certifications: ["Organic", "Pesticide-free"],
          freshness: 100,
          tags: ["premium", "heirloom", "sustainable"]
        }
      ]);
    }
  };

  // Preload all images on component mount
  useEffect(() => {
    produceData.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
      }
    });
  }, [produceData]);

  const categories = ['all', 'Vegetables', 'Grains', 'Leafy Greens', 'Root Vegetables', 'Herbs'];

  const filteredData = useMemo(() => {
    if (filterCategory === 'all') return produceData;
    return produceData.filter(item => 
      item.category?.toLowerCase().includes(filterCategory.toLowerCase())
    );
  }, [filterCategory, produceData]);

  useEffect(() => {
    x.set(0);
    y.set(0);
  }, [currentIndex, x, y]);

  const getCardTransform = useCallback((index) => {
    const seed = index * 7;
    const rotation = ((seed % 10) - 5) * 0.3;
    const xOffset = ((seed % 20) - 10) * 0.2;
    const yOffset = (index - currentIndex) * 6 + Math.sin(seed) * 1.5;
    const scaleValue = Math.max(0.94 - (index - currentIndex) * 0.03, 0.85);
    
    return {
      rotate: `${rotation}deg`,
      translateX: `${xOffset}px`,
      translateY: `${yOffset}px`,
      scale: scaleValue
    };
  }, [currentIndex]);

  const handleDragEnd = useCallback(async (event, info) => {
    if (isAnimating) return;

    const swipeThreshold = 50;
    const swipeVelocityThreshold = 150;

    const isSwipe = Math.abs(info.offset.x) > swipeThreshold || 
                   Math.abs(info.velocity.x) > swipeVelocityThreshold;

    if (isSwipe) {
      setIsAnimating(true);
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);

      const exitX = direction === 'right' ? 250 : -250;
      const exitRotate = direction === 'right' ? 12 : -12;

      await controls.start({
        x: exitX,
        rotate: exitRotate,
        opacity: 0,
        transition: { duration: 0.2, ease: 'easeOut' }
      });

      const currentItem = filteredData[currentIndex];
      if (direction === 'right') {
        setLikedItems(prev => [...prev, currentItem]);
      } else {
        setPassedItems(prev => [...prev, currentItem]);
      }

      setCurrentIndex(prev => (prev + 1) % filteredData.length);
      setSwipeDirection(null);
      setIsAnimating(false);
      controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    } else {
      await controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { type: 'spring', stiffness: 600, damping: 35 }
      });
    }
  }, [controls, isAnimating, filteredData, currentIndex]);

  const handleButtonSwipe = useCallback(async (direction) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    const exitX = direction === 'right' ? 250 : -250;
    const exitRotate = direction === 'right' ? 12 : -12;

    await controls.start({
      x: exitX,
      rotate: exitRotate,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    });

    const currentItem = filteredData[currentIndex];
    if (direction === 'right') {
      setLikedItems(prev => [...prev, currentItem]);
    } else {
      setPassedItems(prev => [...prev, currentItem]);
    }

    setCurrentIndex(prev => (prev + 1) % filteredData.length);
    setSwipeDirection(null);
    setIsAnimating(false);
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  }, [controls, isAnimating, filteredData, currentIndex]);

  const resetAndGoBack = useCallback(() => {
    setCurrentIndex(0);
    setShowMatches(false);
    setLikedItems([]);
    setPassedItems([]);
    setIsAnimating(false);
  }, []);

  const currentItem = filteredData[currentIndex];
  const visibleCards = filteredData.slice(currentIndex, currentIndex + 2);

  if (loading) {
    return (
      <div className="h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
      <style>{styles}</style>
      <div className="h-screen bg-emerald-50 flex flex-col overflow-hidden swipe-container">
        <div className="bg-white border-b border-emerald-200/50 z-50 shadow-sm flex-shrink-0">
          <div className="max-w-md mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-emerald-600">
                    FarmSwipe
                  </span>
                  <p className="text-xs text-gray-500">Fresh • Local • Sustainable</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowMatches(true)}
                  className="relative bg-emerald-100 hover:bg-emerald-200 p-2 rounded-xl transition-colors"
                >
                  <Heart className="w-4 h-4 text-emerald-600" />
                  {likedItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {likedItems.length}
                    </span>
                  )}
                </button>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                  {currentIndex + 1} / {filteredData.length}
                </span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/auth';
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-xl transition-colors"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setFilterCategory(category);
                      setCurrentIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      filterCategory === category
                        ? 'bg-emerald-500 text-white shadow-md'
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

        <div className="flex-1 flex items-center justify-center px-4 py-4">
          <div className="relative w-full max-w-sm h-[520px]">
            <AnimatePresence mode="wait">
              {visibleCards.map((card, stackIndex) => {
                const actualIndex = currentIndex + stackIndex;
                const isTopCard = stackIndex === 0;
                const transform = getCardTransform(actualIndex);

                return (
                  <motion.div
                    key={`${card.id}-${actualIndex}`}
                    className="absolute inset-0 card"
                    style={{
                      zIndex: 10 - stackIndex,
                      ...(!isTopCard && {
                        transform: `rotate(${transform.rotate}) translateX(${transform.translateX}) translateY(${transform.translateY}) scale(${transform.scale})`
                      })
                    }}
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: isTopCard ? 1 : transform.scale, opacity: isTopCard ? 1 : 0.7, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {isTopCard ? (
                      <motion.div
                        className="w-full h-full bg-white rounded-3xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
                        drag="x"
                        dragConstraints={{ left: -150, right: 150 }}
                        dragElastic={0.1}
                        dragMomentum={false}
                        onDragEnd={handleDragEnd}
                        animate={controls}
                        style={{ x, y, rotate, scale }}
                        whileDrag={{ scale: 1.02, transition: { duration: 0.1 } }}
                      >
                        <EnhancedCardContent card={card} userRole={userRole} />
                        <motion.div
                          className="absolute top-8 right-8 pointer-events-none z-10"
                          style={{ opacity: likeOpacity }}
                        >
                          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-md">
                            ❤️ LOVE IT
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute top-8 left-8 pointer-events-none z-10"
                          style={{ opacity: nopeOpacity }}
                        >
                          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-md">
                            ❌ PASS
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="w-full h-full bg-white rounded-3xl shadow-md overflow-hidden pointer-events-none">
                        <EnhancedCardContent card={card} userRole={userRole} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-white border-t border-emerald-200/50 shadow-sm flex-shrink-0">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-center space-x-12">
              <motion.button
                onClick={() => handleButtonSwipe('left')}
                className="w-16 h-16 bg-white border-4 border-red-400 rounded-full flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                disabled={isAnimating}
              >
                <X className="w-8 h-8 text-red-400" />
              </motion.button>
              <motion.button
                onClick={() => handleButtonSwipe('right')}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                disabled={isAnimating}
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              Swipe right to add to cart • Swipe left to pass
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const EnhancedCardContent = React.memo(({ card, userRole }) => (
  <>
    <div className="relative h-4/6 overflow-hidden">
      <img
        src={card.image}
        alt={card.name}
        className="w-full h-full object-cover"
        draggable="false"
      />
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
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-6">
        <div className="text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-1">{card.name}</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="text-sm font-medium">{card.rating}</span>
                  <span className="text-xs opacity-75">({card.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-300">{card.price}</p>
              <p className="text-xs opacity-75">{card.quantity}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm opacity-90">
            <MapPin className="w-4 h-4" />
            <span>{card.farm} • {card.location}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="p-6 h-2/6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Harvested: {card.harvestDate}</span>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            {card.category}
          </span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {card.description}
        </p>
        {card.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
));

const MatchesView = ({ likedItems, userRole, onBack, onReset }) => (
  <div className="min-h-screen bg-emerald-50">
    <div className="bg-white border-b border-emerald-200/50 z-50 sticky top-0">
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
              <h1 className="text-xl font-bold text-gray-800">Your Cart</h1>
              <p className="text-sm text-gray-500">{likedItems.length} items selected</p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No items yet</h2>
          <p className="text-gray-500 mb-6">Start swiping to add fresh produce to your cart!</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            Start Shopping
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
              className="bg-white rounded-2xl p-4 shadow-md flex items-center space-x-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.farm}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-emerald-600 font-bold">{item.price}</span>
                  <span className="text-xs text-gray-400">{item.quantity}</span>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="bg-white rounded-2xl p-6 shadow-md mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total Items:</span>
              <span className="text-lg font-bold text-emerald-600">{likedItems.length}</span>
            </div>
            <button className="w-full bg-emerald-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-all">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Swipe;