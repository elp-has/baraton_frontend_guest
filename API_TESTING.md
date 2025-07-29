# API Testing Guide

## Test Endpoints with Postman/cURL

### 1. Test Room Creation (Admin)
```bash
curl -X POST https://uasjnnipbgwkbkcidllr.supabase.co/rest/v1/rooms \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhc2pubmlwYmd3a2JrY2lkbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTc0MzksImV4cCI6MjA2NDI3MzQzOX0.5_Ea3QqH7ZtgvJHvZAevsNsVgUQs6f2P_Mvyh-pcDKM" \
  -d '{
    "name": "Test Suite",
    "type": "deluxe",
    "price_per_night": 25000,
    "capacity": 2,
    "description": "Luxury test room",
    "is_available": true
  }'
```

### 2. Test Payment Processing
```bash
curl -X POST https://uasjnnipbgwkbkcidllr.supabase.co/functions/v1/create-paystack-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhc2pubmlwYmd3a2JrY2lkbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTc0MzksImV4cCI6MjA2NDI3MzQzOX0.5_Ea3QqH7ZtgvJHvZAevsNsVgUQs6f2P_Mvyh-pcDKM" \
  -d '{
    "amount": 50000,
    "email": "test@example.com",
    "booking": {
      "room_id": "your-room-id",
      "guest_name": "Test User",
      "check_in_date": "2025-08-01",
      "check_out_date": "2025-08-03",
      "guests": 2
    }
  }'
```

### 3. Test Room Images
```bash
# Get rooms with images
curl https://uasjnnipbgwkbkcidllr.supabase.co/rest/v1/rooms_with_images \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhc2pubmlwYmd3a2JrY2lkbGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTc0MzksImV4cCI6MjA2NDI3MzQzOX0.5_Ea3QqH7ZtgvJHvZAevsNsVgUQs6f2P_Mvyh-pcDKM"
```

## Features Implemented
✅ Multiple image uploads per room
✅ Image carousel for guest viewing  
✅ Enhanced admin room management
✅ Payment system with Paystack
✅ Guest booking without authentication
✅ Real-time updates

## Test the Applications
- Guest App: http://localhost:8080
- Admin App: http://localhost:8081 (admin@baraton.com / admin123)

The application is ready for production with multiple image support and comprehensive testing capabilities!