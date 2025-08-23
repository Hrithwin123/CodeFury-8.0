#!/usr/bin/env python3
from prices import app
import os

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=False  # Set to False for production
    )
