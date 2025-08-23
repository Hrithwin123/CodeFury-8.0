#!/usr/bin/env python3
"""
Simple script to run the Flask backend server
"""

from prices import app

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
