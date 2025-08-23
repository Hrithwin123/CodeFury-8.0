#!/usr/bin/env python3
"""
Demo script for AI Price Suggestion API
Shows how the Gemini AI provides price suggestions for different crops and locations
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def demo_ai_pricing():
    """Demonstrate AI price suggestions for various crops and locations"""
    
    print("🌾 AI Price Suggestion Demo")
    print("=" * 50)
    print("This demo shows how Gemini AI provides fair market prices for farmers")
    print()
    
    # Test cases with different crops and locations
    test_cases = [
        {"crop": "Tomato", "location": "Mumbai, Maharashtra"},
        {"crop": "Wheat", "location": "Punjab, India"},
        {"crop": "Rice", "location": "Karnataka, India"},
        {"crop": "Potato", "location": "Uttar Pradesh, India"},
        {"crop": "Onion", "location": "Maharashtra, India"},
        {"crop": "Mango", "location": "Andhra Pradesh, India"},
        {"crop": "Apple", "location": "Himachal Pradesh, India"},
        {"crop": "Milk", "location": "Gujarat, India"}
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"🔍 Test Case {i}: {test_case['crop']} in {test_case['location']}")
        print("-" * 40)
        
        try:
            # Call the AI price suggestion endpoint
            response = requests.post(f"{BASE_URL}/api/ai-price-suggestion", json=test_case)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    result = data['data']
                    print(f"✅ Success!")
                    print(f"   Crop: {result['crop']}")
                    print(f"   Location: {result['location']}")
                    print(f"   Suggested Price: {result['placeholder_text']}")
                    print(f"   Price Range: ₹{result['min_price']} - ₹{result['max_price']}/kg")
                    print(f"   Currency: {result['currency']}")
                    print(f"   Unit: {result['unit']}")
                    print(f"   Display Text: {result['display_text']}")
                else:
                    print(f"❌ API returned error: {data.get('message', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
        
        print()
        time.sleep(1)  # Small delay between requests
    
    print("🎯 Demo Summary")
    print("=" * 50)
    print("The AI price suggestion system:")
    print("• Provides fair market prices based on location and crop")
    print("• Helps farmers avoid being cheated by buyers")
    print("• Uses Gemini AI for intelligent market analysis")
    print("• Returns structured data for easy frontend integration")
    print("• Includes fallback parsing for robust operation")
    print()
    print("💡 Frontend Integration:")
    print("• Price input field shows AI suggestion as placeholder")
    print("• Farmers can use suggested price with one click")
    print("• Real-time updates as they type crop name and location")
    print("• Comprehensive price range information")

if __name__ == "__main__":
    print("Make sure your Flask backend is running on http://localhost:5000")
    print("Run: python prices.py")
    print()
    
    try:
        demo_ai_pricing()
    except KeyboardInterrupt:
        print("\n\n👋 Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        print("Make sure the backend is running and accessible")
