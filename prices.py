from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import re
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Load configuration from environment variables
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
PORT = int(os.getenv('PORT', 5000))
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBSMNRjEWGaEIyMyUOe0R9d_eanMTtZJv8')
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173').split(',')

# Configure CORS
CORS(app, origins=CORS_ORIGINS)

def get_optimal_price_range(crop_name, location, api_key):
    """
    Function to get the optimal min and max price range for a crop in a specific location
    using the Gemini API, ensuring farmers don't get cheated. Temperature is set to 0 for deterministic output.
    
    Args:
    - crop_name (str): The name of the crop (e.g., 'wheat').
    - location (str): The location (e.g., 'India' or 'Punjab, India').
    - api_key (str): Your Gemini API key.
    
    Returns:
    - tuple: (min_price, max_price) as floats, or (None, None) if parsing fails.
    """
    try:
        logger.info(f"Starting Gemini API call for {crop_name} in {location}")
        logger.info(f"Using API key: {api_key[:10]}...")
        
        genai.configure(api_key=api_key)
        logger.info("Gemini configured successfully")
        
        # Try different models in case one doesn't work
        models_to_try = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
        model = None
        
        for model_name in models_to_try:
            try:
                logger.info(f"Trying model: {model_name}")
                model = genai.GenerativeModel(model_name)
                # Test if model works
                test_response = model.generate_content("Hello")
                logger.info(f"Model {model_name} is working")
                break
            except Exception as model_error:
                logger.warning(f"Model {model_name} failed: {str(model_error)}")
                continue
        
        if not model:
            logger.error("All models failed to initialize")
            return None, None
        
        prompt = (
            f"Based on current market data, provide the optimal minimum and maximum selling price range "
            f"for {crop_name} in {location} to ensure farmers do not get cheated by buyers. "
            f"The range should be fair and based on location-specific factors. "
            f"Respond ONLY with a valid JSON object in this exact format: "
            f'{{"min_price": X, "max_price": Y, "currency": "₹", "unit": "per kg", "location": "{location}", "crop": "{crop_name}"}} '
            f"where X and Y are numbers representing prices in Indian Rupees per kg. "
            f"Do not include any other text, explanations, or formatting - just the JSON object."
        )
        
        logger.info(f"Generated prompt: {prompt}")
        
        generation_config = {
            "temperature": 0.0,  # Set to 0 for deterministic output
            "top_p": 1,
            "top_k": 1,
            "max_output_tokens": 100
        }
        
        logger.info("Calling Gemini API...")
        response = model.generate_content(prompt, generation_config=generation_config)
        
        text = response.text.strip()
        logger.info(f"Gemini API Response: {text}")
        
        # Try to parse as JSON first
        try:
            import json
            # Clean the response text to extract just the JSON part
            # Remove any markdown formatting if present
            if text.startswith('```json'):
                text = text.replace('```json', '').replace('```', '').strip()
            elif text.startswith('```'):
                text = text.replace('```', '').strip()
            
            # Parse JSON
            data = json.loads(text)
            min_price = float(data.get('min_price', 0))
            max_price = float(data.get('max_price', 0))
            
            logger.info(f"Successfully parsed JSON: min_price={min_price}, max_price={max_price}")
            return min_price, max_price
            
        except (json.JSONDecodeError, ValueError, KeyError) as json_error:
            logger.warning(f"JSON parsing failed: {json_error}")
            logger.info("Attempting regex parsing as fallback...")
            
            # Fallback: Use regex to extract numbers
            try:
                # Look for price patterns like "min_price": X or "max_price": Y
                min_match = re.search(r'"min_price":\s*(\d+(?:\.\d+)?)', text)
                max_match = re.search(r'"max_price":\s*(\d+(?:\.\d+)?)', text)
                
                if min_match and max_match:
                    min_price = float(min_match.group(1))
                    max_price = float(max_match.group(1))
                    logger.info(f"Regex parsing successful: min_price={min_price}, max_price={max_price}")
                    return min_price, max_price
                else:
                    logger.error("Regex parsing failed: Could not find min_price or max_price")
                    return None, None
                    
            except Exception as regex_error:
                logger.error(f"Regex parsing also failed: {regex_error}")
                return None, None
                
    except Exception as e:
        logger.error(f"Error in get_optimal_price_range: {str(e)}")
        return None, None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Gemini AI Price Suggestion API',
        'timestamp': datetime.now().isoformat(),
        'environment': FLASK_ENV,
        'debug': DEBUG,
        'port': PORT,
        'gemini_configured': bool(GEMINI_API_KEY)
    }), 200

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify the API is working"""
    return jsonify({
        'success': True,
        'message': 'Gemini AI Price Suggestion API is working!',
        'timestamp': datetime.now().isoformat(),
        'environment': FLASK_ENV,
        'gemini_configured': bool(GEMINI_API_KEY)
    }), 200

@app.route('/api/ai-price-suggestion', methods=['POST'])
def get_ai_price_suggestion():
    """Get AI-powered price suggestion for crops"""
    try:
        # Check if request has JSON body
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Invalid request',
                'message': 'JSON body is required'
            }), 400
        
        # Extract parameters
        data = request.get_json()
        crop = data.get('crop')
        location = data.get('location')
        
        # Validate required parameters
        if not crop:
            return jsonify({
                'success': False,
                'error': 'Missing required field',
                'message': 'crop field is required'
            }), 400
            
        if not location:
            return jsonify({
                'success': False,
                'error': 'Missing required field',
                'message': 'location field is required'
            }), 400
        
        logger.info(f"Getting AI price suggestion for {crop} in {location}")
        
        # Get price suggestion from Gemini AI
        min_price, max_price = get_optimal_price_range(crop, location, GEMINI_API_KEY)
        
        if min_price is not None and max_price is not None:
            # Calculate modal price (average) - this will be the suggested price
            suggested_price = round((min_price + max_price) / 2, 2)
            
            result = {
                'success': True,
                'data': {
                    'crop': crop,
                    'location': location,
                    'min_price': min_price,
                    'max_price': max_price,
                    'suggested_price': suggested_price,
                    'currency': '₹',
                    'unit': 'per kg',
                    'display_text': f"AI Suggestion: ₹{suggested_price}/kg (Range: ₹{min_price}-₹{max_price}/kg)",
                    'placeholder_text': f"₹{suggested_price}/kg"
                },
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Successfully generated AI price suggestion: {result}")
            return jsonify(result), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate price suggestion',
                'message': f'Unable to get AI price data for {crop} in {location}. Please try again.',
                'data': {
                    'crop': crop,
                    'location': location,
                    'placeholder_text': 'Enter price per kg'
                },
                'timestamp': datetime.now().isoformat()
            }), 200
            
    except Exception as e:
        logger.error(f"Error in get_ai_price_suggestion endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    logger.info(f"Starting Gemini AI Price Suggestion API Service on port {PORT}")
    logger.info(f"Environment: {FLASK_ENV}")
    logger.info(f"Debug mode: {DEBUG}")
    logger.info(f"Gemini API Key configured: {bool(GEMINI_API_KEY)}")
    
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
