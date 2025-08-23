#!/usr/bin/env python3
"""
Test script for the Gemini AI Backend API
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_basic_endpoint():
    """Test the basic test endpoint"""
    print("\n🔍 Testing basic endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/test")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Basic endpoint test failed: {e}")
        return False

def test_gemini():
    """Test the Gemini AI endpoint"""
    print("\n🔍 Testing Gemini AI endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/test-gemini")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Gemini AI test failed: {e}")
        return False

def test_price_suggestion_get():
    """Test price suggestion with GET method"""
    print("\n🔍 Testing price suggestion (GET)...")
    try:
        params = {
            'crop': 'Tomato',
            'location': 'Mumbai, Maharashtra'
        }
        response = requests.get(f"{BASE_URL}/api/price-suggestion", params=params)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Price suggestion GET test failed: {e}")
        return False

def test_price_suggestion_post():
    """Test price suggestion with POST method"""
    print("\n🔍 Testing price suggestion (POST)...")
    try:
        data = {
            'crop': 'Wheat',
            'location': 'Punjab, India'
        }
        response = requests.post(f"{BASE_URL}/api/price-suggestion", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Price suggestion POST test failed: {e}")
        return False

def test_ai_price_suggestion():
    """Test the new AI price suggestion endpoint"""
    print("\n🔍 Testing AI price suggestion endpoint...")
    try:
        data = {
            'crop': 'Tomato',
            'location': 'Mumbai, Maharashtra'
        }
        response = requests.post(f"{BASE_URL}/api/ai-price-suggestion", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and result.get('data', {}).get('placeholder_text'):
                print("✅ AI price suggestion endpoint working correctly!")
                print(f"   Suggested price: {result['data']['placeholder_text']}")
                print(f"   Price range: ₹{result['data']['min_price']} - ₹{result['data']['max_price']}/kg")
            else:
                print("⚠️  AI price suggestion returned but no placeholder text")
        else:
            print("❌ AI price suggestion endpoint failed")
            
        return response.status_code == 200
    except Exception as e:
        print(f"❌ AI price suggestion test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Gemini AI Backend API Tests")
    print("=" * 50)
    
    # Wait a moment for server to start
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    tests = [
        test_health,
        test_basic_endpoint,
        test_gemini,
        test_price_suggestion_get,
        test_price_suggestion_post,
        test_ai_price_suggestion
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
            print("✅ Test passed")
        else:
            print("❌ Test failed")
        print("-" * 30)
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the server logs for more details.")

if __name__ == "__main__":
    main()
