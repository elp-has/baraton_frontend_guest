# Baraton Oasis Hotel Management System

A comprehensive hotel booking and management system built with React, TypeScript, Tailwind CSS, and Supabase.

## 🏨 Features

- **Guest Booking System**: Online room reservations with payment processing
- **Admin Dashboard**: Complete hotel management interface
- **Payment Integration**: Paystack payment gateway for secure transactions
- **Room Management**: CRUD operations for room inventory
- **Analytics**: Revenue and booking analytics
- **Responsive Design**: Mobile-friendly interface

## 📂 Project Structure

```
├── / (Guest Application)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx (Landing page)
│   │   │   ├── Bookings.tsx (Guest bookings)
│   │   │   └── PaymentSuccess.tsx
│   │   └── components/
│   │       ├── HeroSection.tsx
│   │       ├── RoomShowcase.tsx
│   │       └── BookingDialog.tsx
│   └── package.json
└── admin/ (Admin Application)
    ├── src/
    │   ├── pages/
    │   │   └── Admin.tsx (Admin dashboard)
    │   └── components/
    │       ├── AdminLogin.tsx
    │       └── RoomEditDialog.tsx
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 1. Clone and Install Dependencies

```bash
# Install guest application dependencies
npm install

# Install admin application dependencies
cd admin
npm install
cd ..
```

### 2. Environment Setup

The applications use hardcoded Supabase configuration. For production, update:
- `src/integrations/supabase/client.ts` (guest app)
- `admin/src/integrations/supabase/client.ts` (admin app)

### 3. Database Setup

Follow `supabaseCopy.md` to set up your Supabase backend:

1. Create a new Supabase project
2. Run all SQL migrations from `supabase/migrations/`
3. Set up storage buckets and policies
4. Configure edge functions
5. Add required secrets

### 4. Payment Configuration

Set up Paystack integration:

1. Get your Paystack secret key from [Paystack Dashboard](https://dashboard.paystack.com/)
2. Add to Supabase secrets:
   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=your_secret_key
   ```

### 5. Run Applications

```bash
# Start guest application (port 8080)
npm run dev

# Start admin application (port 8081)
cd admin
npm run dev
```

## 🔑 Admin Access

**Default Admin Credentials:**
- Email: admin@baraton.com
- Password: admin123

⚠️ **Change these credentials in production!**

## 🏗️ Development

### Guest Application Structure
- **Port**: 8080
- **Routes**: `/`, `/bookings`, `/payment-success`
- **Features**: Room browsing, booking, payment

### Admin Application Structure  
- **Port**: 8081
- **Routes**: `/` (admin dashboard)
- **Features**: Room management, booking oversight, analytics

## 🚀 Deployment

### Guest Application
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Admin Application
```bash
cd admin
npm run build
# Deploy dist/ folder to your hosting service
```

### Environment Variables
Update Supabase URLs and keys in:
- `src/config/environment.ts`
- `admin/src/config/environment.ts`

## 📊 Analytics & Monitoring

The system includes:
- Revenue tracking
- Booking analytics
- Room occupancy rates
- Guest metrics

## 🛡️ Security Features

- Row Level Security (RLS) on all tables
- Input validation and sanitization
- Secure payment processing
- Admin authentication
- Rate limiting on edge functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.# baraton_frontend_guest
# baraton_frontend_guest
# baraton_frontend_guest
# baraton_guest
