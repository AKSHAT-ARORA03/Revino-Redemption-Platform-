# Reward System Platform

A comprehensive reward management system built with Next.js, MongoDB, and TypeScript.

## 🚀 Features

- **Multi-role Authentication** (Superadmin, Company Admin, Employee)
- **Coin Management System** with real-time tracking
- **Brand Voucher Marketplace** with 24+ premium vouchers
- **Email Distribution System** for redemption codes
- **Real-time Dashboard** with statistics and analytics
- **MongoDB Database** for persistent data storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Database**: MongoDB with native driver
- **Email**: Nodemailer with SMTP
- **UI Components**: Radix UI, Lucide Icons

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- SMTP email account (Gmail recommended)

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=reward_system

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Reward System" <your-email@gmail.com>

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### For Production (MongoDB Atlas):
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reward_system?retryWrites=true&w=majority
\`\`\`

## 🚀 Installation & Setup

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd reward-system
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up MongoDB**
   - **Local**: Install MongoDB and start the service
   - **Cloud**: Create a MongoDB Atlas cluster and get connection string

4. **Configure environment variables**
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your actual values
\`\`\`

5. **Set up Gmail SMTP (recommended)**
   - Enable 2-factor authentication on Gmail
   - Generate an App Password: Google Account → Security → App passwords
   - Use the app password in `SMTP_PASS`

6. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

7. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Default superadmin: `superadmin@gmail.com` / `superadmin`

## 📊 Database Collections

The system automatically creates these MongoDB collections:

- `users` - User accounts and coin balances
- `vouchers` - Available vouchers and rewards
- `coinTransactions` - All coin-related transactions
- `redemptionCodes` - Employee redemption codes
- `voucherPurchases` - Voucher purchase records
- `voucherAssignments` - Voucher assignments to employees
- `activityLogs` - System activity tracking

## 🎯 User Roles & Features

### Superadmin
- Manage coin inventory (add/remove)
- Create and manage vouchers
- Approve coin requests from companies
- Track all system activity
- View comprehensive analytics

### Company Admin
- Request coins from superadmin
- Distribute coins to employees via CSV upload
- Purchase vouchers for employee assignment
- View company statistics and reports

### Employee
- Redeem codes sent by company admin
- Purchase vouchers from marketplace
- View redemption history
- Track coin balance

## 🏷️ Sample Vouchers

The system includes 24 premium brand vouchers:

**Featured Brands**: Amazon, Starbucks, Netflix, Spotify, Apple, Google
**Categories**: Shopping, Food & Beverage, Entertainment, Gaming, Health & Fitness, Fashion, Education, Travel

## 🔧 Development

\`\`\`bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

## 📧 Email Configuration

The system supports various SMTP providers:

**Gmail** (recommended):
- Host: `smtp.gmail.com`
- Port: `587`
- Use App Password for authentication

**Other providers**: Update SMTP settings accordingly

## 🚀 Deployment

### Vercel (recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other platforms
1. Build the project: `npm run build`
2. Set environment variables
3. Start with: `npm start`

## 🔒 Security Features

- HTTP-only cookies for authentication
- Password validation (upgrade to bcrypt recommended)
- Role-based access control
- Input validation and sanitization
- CORS protection

## 📈 Monitoring

- Real-time coin balance tracking
- Activity logging for all operations
- Transaction history and audit trails
- User engagement analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
