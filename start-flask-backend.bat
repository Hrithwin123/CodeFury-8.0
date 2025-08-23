@echo off
echo Starting Flask Backend for Mandi Price API...
echo.
echo Make sure you have Python and Flask installed:
echo pip install flask flask-cors requests
echo.
cd backend
echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python flask.py
pause
