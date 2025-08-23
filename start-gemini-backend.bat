@echo off
echo Starting Gemini AI Backend Server...
echo.

cd backend

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask server...
echo Server will be available at: http://localhost:5000
echo.
echo Available endpoints:
echo - GET  /health - Health check
echo - GET  /test - Test endpoint
echo - GET  /test-gemini - Test Gemini AI
echo - GET  /api/price-suggestion?crop={crop}&location={location}
echo - POST /api/price-suggestion
echo - POST /api/ai-price-suggestion - NEW: Frontend-optimized endpoint
echo.
echo Testing and Demo:
echo - python test_api.py - Run comprehensive API tests
echo - python demo_ai_pricing.py - Demo AI pricing with various crops
echo.

python prices.py

pause
