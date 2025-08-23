import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { Leaf } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = ['farmer', 'distributor', 'equipment_seller'], redirectTo = '/auth' }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const role = user.user_metadata?.user_role || 'consumer';
          setUserRole(role);
          
          // Check if user has access to this route
          if (!allowedRoles.includes(role)) {
            // Redirect based on role
                           if (role === 'farmer') {
                 window.location.href = '/farmer-dashboard';
               } else if (role === 'distributor') {
                 window.location.href = '/distributor-dashboard';
               } else if (role === 'equipment_seller') {
                 window.location.href = '/equipment-seller-dashboard';
               } else {
                 // Default to distributor dashboard for any other role
                 window.location.href = '/distributor-dashboard';
               }
            return;
          }
        } else {
          window.location.href = redirectTo;
        }
      } catch (error) {
        console.error('Error checking user:', error);
        window.location.href = redirectTo;
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [allowedRoles, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(userRole)) {
    return null; // Will redirect
  }

  return children;
};

export default ProtectedRoute;
