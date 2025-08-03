import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null); // ✅ NEW STATE
  const reference = searchParams.get('reference');

  let API_BASE_URL = import.meta.env.VITE_RAILWAY_API_URL || '';
  if (API_BASE_URL && !API_BASE_URL.startsWith('http')) {
    API_BASE_URL = `https://${API_BASE_URL}`;
  }

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/by-reference/${reference}`);
        const data = await res.json();
        setBookingStatus(data.booking?.status || null);
      } catch (err) {
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    if (reference) fetchBookingStatus();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isConfirmed = bookingStatus === 'confirmed'; // ✅ DYNAMIC CHECK

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isConfirmed ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {isConfirmed ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Clock className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <CardTitle className={`text-2xl ${isConfirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                {isConfirmed ? 'Payment Successful!' : 'Payment Received'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {isConfirmed
                  ? 'Your booking has been confirmed. Thank you!'
                  : 'We have received your payment and are processing your booking.'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-sm text-gray-500">
                Reference: <span className="font-mono text-black">{reference}</span>
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link to="/bookings">View My Bookings</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
// This code is a React component that displays a payment success page.
// It fetches the booking status based on a reference from the URL and displays appropriate messages and  icons based on the booking status.
// It also includes navigation and footer components for a complete page layout.