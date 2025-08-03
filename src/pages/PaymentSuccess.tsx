import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import axios from 'axios';
import { config } from '@/config/environment';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) return;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${config.railway.url}/api/bookings/by-reference/${encodeURIComponent(reference)}`);
        const bookingStatus = res.data.booking?.status;
        if (bookingStatus) setStatus(bookingStatus);
      } catch (err) {
        console.error('Failed to fetch booking status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const timer = setTimeout(fetchStatus, 3000); // Retry in case webhook was slightly delayed
    return () => clearTimeout(timer);
  }, [reference]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto"></div>
              <p className="mt-4 text-gray-600">Processing your payment...</p>
            </div>
          ) : (
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">
                  {status === 'confirmed' ? 'Payment & Booking Confirmed!' : 'Payment Received'}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {status === 'confirmed'
                    ? 'Thank you! Your booking has been confirmed.'
                    : 'Thank you for your payment. We are still processing your booking.'}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-gray-700">
                  You will receive a confirmation email shortly.
                </p>
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
