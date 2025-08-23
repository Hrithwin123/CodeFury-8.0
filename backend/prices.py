from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import re
import os
from datetime import datetime
import logging
from config import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Configure CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    return app

app = create_app()

# Configuration
GEMINI_API_KEY = app.config['GEMINI_API_KEY']

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
            json_start = text.find('{')
            json_end = text.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                json_text = text[json_start:json_end]
                data = json.loads(json_text)
                
                min_price = float(data.get('min_price', 0))
                max_price = float(data.get('max_price', 0))
                
                if min_price > 0 and max_price > 0 and max_price >= min_price:
                    logger.info(f"Successfully parsed JSON prices: Min={min_price}, Max={max_price}")
                    return min_price, max_price
                else:
                    logger.warning(f"Invalid price values in JSON: min={min_price}, max={max_price}")
            else:
                logger.warning("No JSON object found in response")
                
        except (json.JSONDecodeError, KeyError, ValueError) as json_error:
            logger.warning(f"JSON parsing failed: {json_error}")
        
        # Fallback to regex parsing if JSON fails
        logger.info("Falling back to regex parsing...")
        match = re.search(r'Min:\s*([\d\.]+)\s*Max:\s*([\d\.]+)', text)
        if match:
            min_price = float(match.group(1))
            max_price = float(match.group(2))
            logger.info(f"Successfully parsed prices with regex: Min={min_price}, Max={max_price}")
            return min_price, max_price
        else:
            # Try alternative parsing patterns
            alt_match = re.search(r'(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)', text)
            if alt_match:
                min_price = float(alt_match.group(1))
                max_price = float(alt_match.group(2))
                logger.info(f"Parsed with alternative pattern: Min={min_price}, Max={max_price}")
                return min_price, max_price
            
            # Try to find any numbers in the response
            numbers = re.findall(r'(\d+(?:\.\d+)?)', text)
            if len(numbers) >= 2:
                min_price = float(numbers[0])
                max_price = float(numbers[1])
                if max_price < min_price:
                    min_price, max_price = max_price, min_price
                logger.info(f"Extracted numbers from response: Min={min_price}, Max={max_price}")
                return min_price, max_price
        
        logger.error("All parsing methods failed")
        return None, None
            
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return None, None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Gemini AI Price Suggestion API',
        'timestamp': datetime.now().isoformat(),
        'config': {
            'environment': app.config['FLASK_ENV'],
            'debug': app.config['DEBUG'],
            'gemini_configured': bool(GEMINI_API_KEY)
        }
    }), 200

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify API is working"""
    return jsonify({
        'success': True,
        'message': 'Gemini AI Price API is working!',
        'timestamp': datetime.now().isoformat(),
        'config': {
            'environment': app.config['FLASK_ENV'],
            'debug': app.config['DEBUG']
        }
    }), 200

@app.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test endpoint to verify Gemini AI is working"""
    try:
        logger.info("Testing Gemini AI connection...")
        
        # Test with a simple query
        min_price, max_price = get_optimal_price_range("Tomato", "Bangalore, Karnataka", GEMINI_API_KEY)
        
        if min_price is not None and max_price is not None:
            return jsonify({
                'success': True,
                'message': 'Gemini AI is working!',
                'test_result': {
                    'crop': 'Tomato',
                    'location': 'Bangalore, Karnataka',
                    'min_price': min_price,
                    'max_price': max_price
                },
                'timestamp': datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Gemini AI test failed - could not get price data',
                'timestamp': datetime.now().isoformat()
            }), 200
            
    except Exception as e:
        logger.error(f"Gemini test failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Gemini AI test failed with error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/price-suggestion', methods=['GET'])
def get_price_suggestion():
    """
    GET endpoint to fetch AI-powered price suggestions
    
    Query Parameters:
        crop (required): Name of the crop
        location (required): Location (city, state, country)
    """
    try:
        # Get query parameters
        crop = request.args.get('crop')
        location = request.args.get('location')
        
        # Validate required parameters
        if not crop:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter',
                'message': 'crop parameter is required'
            }), 400
            
        if not location:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter',
                'message': 'location parameter is required'
            }), 400
        
        logger.info(f"Getting price suggestion for {crop} in {location}")
        
        # Get price suggestion from Gemini AI
        min_price, max_price = get_optimal_price_range(crop, location, GEMINI_API_KEY)
        
        if min_price is not None and max_price is not None:
            # Calculate modal price (average)
            modal_price = round((min_price + max_price) / 2, 2)
            
            result = {
                'success': True,
                'data': {
                    'crop': crop,
                    'location': location,
                    'min_price': min_price,
                    'max_price': max_price,
                    'modal_price': modal_price,
                    'currency': '₹',
                    'unit': 'per kg',
                    'source': 'Gemini AI Market Analysis'
                },
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Successfully generated price suggestion: {result}")
            return jsonify(result), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate price suggestion',
                'message': f'Unable to get price data for {crop} in {location}. Please try again.',
                'timestamp': datetime.now().isoformat()
            }), 200
            
    except Exception as e:
        logger.error(f"Error in get_price_suggestion endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/price-suggestion', methods=['POST'])
def post_price_suggestion():
    """
    POST endpoint to fetch AI-powered price suggestions
    
    JSON Body:
        {
            "crop": "string (required)",
            "location": "string (required)"
        }
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Invalid request',
                'message': 'JSON body is required'
            }), 400
        
        # Extract parameters
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
        
        logger.info(f"Getting price suggestion for {crop} in {location}")
        
        # Get price suggestion from Gemini AI
        min_price, max_price = get_optimal_price_range(crop, location, GEMINI_API_KEY)
        
        if min_price is not None and max_price is not None:
            # Calculate modal price (average)
            modal_price = round((min_price + max_price) / 2, 2)
            
            result = {
                'success': True,
                'data': {
                    'crop': crop,
                    'location': location,
                    'min_price': min_price,
                    'max_price': max_price,
                    'modal_price': modal_price,
                    'currency': '₹',
                    'unit': 'per kg',
                    'source': 'Gemini AI Market Analysis'
                },
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Successfully generated price suggestion: {result}")
            return jsonify(result), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate price suggestion',
                'message': f'Unable to get price data for {crop} in {location}. Please try again.',
                'timestamp': datetime.now().isoformat()
            }), 200
            
    except Exception as e:
        logger.error(f"Error in post_price_suggestion endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/ai-price-suggestion', methods=['POST'])
def get_ai_price_suggestion():
    """
    Frontend-specific endpoint for AI price suggestions
    Returns detailed price information for display in price input fields
    
    JSON Body:
        {
            "crop": "string (required)",
            "location": "string (required)"
        }
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Invalid request',
                'message': 'JSON body is required'
            }), 400
        
        # Extract parameters
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
    port = app.config['PORT']
    debug = app.config['DEBUG']
    
    logger.info(f"Starting Gemini AI Price Suggestion API Service on port {port}")
    logger.info(f"Environment: {app.config['FLASK_ENV']}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"Gemini API Key configured: {bool(GEMINI_API_KEY)}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

