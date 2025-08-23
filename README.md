# 🌾 HarvestLink - Agriculture Marketplace Platform

A comprehensive digital marketplace platform that connects farmers, distributors, and equipment sellers through an innovative bidding system, AI-powered price suggestions, and secure payment processing.

## 🚀 Features

### Core Functionality
- **Multi-Role User System**: Farmers, Distributors, and Equipment Sellers
- **AI-Powered Price Suggestions**: Gemini AI integration for fair market pricing
- **Bidding System**: Real-time auction system for produce and equipment
- **Secure Payment Processing**: Razorpay integration with card tokenization
- **Real-time Updates**: Live bid tracking and auction status updates
- **Responsive Design**: Mobile-first approach with modern UI/UX

### User Roles & Capabilities

#### 👨‍🌾 Farmers
- List produce with detailed information
- Set starting bids and auction parameters
- Accept/reject distributor bids
- Manage payment configurations
- View market insights and pricing

#### 🏪 Distributors
- Browse and bid on farmer produce
- Participate in equipment auctions
- Manage bidding history
- Direct communication with sellers
- Secure payment processing

#### 🔧 Equipment Sellers
- List agricultural equipment
- Create auction sessions
- Manage equipment inventory
- Track bidding activity

## 🏗️ Architecture

### Frontend
- **React 19** with modern hooks and context
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Flask** Python web framework
- **Gemini AI** integration for price suggestions
- **CORS** enabled for frontend integration
- **Environment-based configuration**

### Database & Infrastructure
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with Row Level Security (RLS)
- **Real-time subscriptions** for live updates
- **Edge Functions** for serverless operations

### Payment System
- **Razorpay** integration
- **Card tokenization** for secure payments
- **Webhook handling** for payment verification

## 📁 Project Structure

```
agriculture/
├── backend/                 # Flask backend with Gemini AI
│   ├── prices.py           # AI price suggestion API
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # Backend documentation
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   │   ├── AuctionManagement.jsx
│   │   ├── BiddingSystem.jsx
│   │   ├── PaymentConfiguration.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Application pages
│   │   ├── Landing.jsx     # Homepage
│   │   ├── Auth.jsx        # Authentication
│   │   ├── FarmerDashboard.jsx
│   │   ├── DistributorDashboard.jsx
│   │   └── EquipmentSellerDashboard.jsx
│   └── App.jsx             # Main application component
├── supabase/               # Supabase configuration
│   └── functions/          # Edge functions
│       ├── process-bid/    # Bid processing
│       ├── finalize-auction/ # Auction finalization
│       └── razorpay-webhook/ # Payment webhooks
├── database_setup_corrected.sql  # Database schema
└── package.json            # Node.js dependencies
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- Gemini AI API key
- Razorpay account

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY="your_gemini_api_key"
export FLASK_ENV="development"

# Start Flask server
python prices.py
```

**Note**: The backend is now deployed on Render and accessible at: `https://flask-microservice-czu7.onrender.com`

### Database Setup
1. Create a Supabase project
2. Run the SQL scripts in `database_setup_corrected.sql`
3. Configure environment variables in your Supabase dashboard
4. Set up Row Level Security policies

### Environment Variables
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🔌 API Endpoints

### Price Suggestion API
- `GET /api/price-suggestion?crop={crop}&location={location}`
- `POST /api/price-suggestion` with JSON body
- `POST /api/ai-price-suggestion` - Frontend-specific AI price suggestions
- `GET /health` - Health check
- `GET /test` - API test endpoint
- `GET /test-gemini` - Gemini AI test

**Base URL**: `https://flask-microservice-czu7.onrender.com`

### Supabase Edge Functions
- `/process-bid` - Process equipment bids
- `/process-produce-bid` - Process produce bids
- `/finalize-auction` - Complete auction sessions
- `/razorpay-webhook` - Handle payment webhooks

## 🎯 Key Features Explained

### AI Price Suggestions
The platform uses Google's Gemini AI to provide fair market prices for agricultural produce:
- Location-specific pricing
- Market trend analysis
- Fair pricing to prevent farmer exploitation
- Deterministic output for consistency

### Bidding System
Real-time auction system with:
- Live bid updates
- Automatic bid validation
- Time-based auction endings
- Secure payment processing
- Bid history tracking

### Security Features
- Row Level Security (RLS) policies
- JWT authentication
- Role-based access control
- Secure payment tokenization
- Input validation and sanitization

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
# Use the provided batch files for Windows
start-flask-backend.bat
start-gemini-backend.bat

# Or deploy to cloud platforms like:
# - Render (Currently deployed)
# - Heroku
# - AWS Lambda
# - Google Cloud Functions
```

**Current Deployment**: The backend is deployed on Render at `https://flask-microservice-czu7.onrender.com`

### Supabase Functions
```bash
# Deploy edge functions
supabase functions deploy
```

## 📱 Mobile Optimization

The platform is designed with a mobile-first approach:
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized navigation for mobile devices
- Progressive Web App capabilities

## 🔒 Security Considerations

- All database queries use parameterized statements
- Row Level Security prevents unauthorized access
- JWT tokens for authentication
- Secure payment processing with Razorpay
- Input validation on both frontend and backend

## 🧪 Testing

### Frontend Testing
```bash
npm run lint          # ESLint checking
npm run preview       # Preview production build
```

### Backend Testing
```bash
# Test local endpoints
curl http://localhost:5000/health
curl http://localhost:5000/test
curl http://localhost:5000/test-gemini

# Test deployed endpoints
curl https://flask-microservice-czu7.onrender.com/health
curl https://flask-microservice-czu7.onrender.com/test
curl https://flask-microservice-czu7.onrender.com/api/ai-price-suggestion -X POST -H "Content-Type: application/json" -d '{"crop":"tomatoes","location":"mumbai"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in each component
- Review the SQL setup scripts
- Examine the API endpoints
- Check the Supabase dashboard for database issues

## 🆕 Recent Updates

### Backend Deployment (August 2025)
- ✅ **Backend successfully deployed on Render**
- ✅ **Frontend updated to use deployed backend**
- ✅ **AI price suggestions now working in production**
- ✅ **CORS configured for production deployment**

### Key Changes Made
- Moved backend files to root directory for Render deployment
- Created `render.yaml` for declarative service configuration
- Added `.renderignore` to exclude frontend files from backend deployment
- Updated frontend to use `https://flask-microservice-czu7.onrender.com`
- Simplified backend configuration for production deployment

## 🔮 Future Enhancements

- Advanced analytics dashboard
- Weather integration for crop planning
- Supply chain tracking
- Mobile app development
- Multi-language support
- Advanced AI pricing models

---

**Built with ❤️ for the agricultural community**