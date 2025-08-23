# Gemini AI Price Suggestion Backend

A Flask-based backend service that provides AI-powered price suggestions for agricultural products using Google's Gemini AI.

## Features

- **AI-Powered Price Suggestions**: Uses Gemini AI to generate optimal price ranges for crops
- **Location-Based Analysis**: Considers location-specific factors for accurate pricing
- **Automatic Price Calculation**: Calculates min, max, and modal prices
- **RESTful API**: Simple HTTP endpoints for easy integration
- **CORS Enabled**: Ready for frontend integration

## Installation

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables** (optional):
   ```bash
   # Create a .env file in the backend directory
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```

## Usage

### Start the server:
```bash
python prices.py
```

Or use the batch script:
```bash
start-gemini-backend.bat
```

### API Endpoints

#### 1. Health Check
- **GET** `/health`
- Returns service status

#### 2. Test Endpoint
- **GET** `/test`
- Verifies API functionality

#### 3. Get Price Suggestion
- **GET** `/api/price-suggestion?crop=Tomato&location=Bangalore, Karnataka`
- **POST** `/api/price-suggestion`
  ```json
  {
    "crop": "Tomato",
    "location": "Bangalore, Karnataka"
  }
  ```

### Example Response
```json
{
  "success": true,
  "data": {
    "crop": "Tomato",
    "location": "Bangalore, Karnataka",
    "min_price": 25.0,
    "max_price": 35.0,
    "modal_price": 30.0,
    "currency": "₹",
    "unit": "per kg",
    "source": "Gemini AI Market Analysis"
  },
  "timestamp": "2025-08-23T15:30:00.000Z"
}
```

## How It Works

1. **Input Processing**: Takes crop name and location as input
2. **AI Analysis**: Uses Gemini AI to analyze market conditions and generate price suggestions
3. **Price Calculation**: Calculates min, max, and modal prices based on AI analysis
4. **Response Formatting**: Returns structured data with pricing information

## Configuration

- **Port**: Default 5000 (configurable via PORT environment variable)
- **API Key**: Uses GEMINI_API_KEY environment variable or default key
- **Model**: Uses Gemini 1.5 Flash for optimal performance

## Error Handling

The API provides comprehensive error handling:
- Missing parameters
- API failures
- Parsing errors
- Network timeouts

All errors return structured responses with meaningful messages.

## Frontend Integration

The API is designed to work seamlessly with React frontends:
- CORS enabled for cross-origin requests
- Consistent response format
- Error handling for user-friendly messages
