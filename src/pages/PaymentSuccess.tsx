import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reference) {
      setError('No reference provided');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await axios.get(`/api/bookings/by-reference/${reference}`);
        if (!res.data?.booking) {
          throw new Error('No booking found');
        }
        console.log('✅ Booking fetched:', res.data.booking);
        setBooking(res.data.booking);
      } catch (err) {
        setError('Booking not found or failed to load');
        console.error('❌ Error fetching booking by reference:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [reference]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <p className="text-gray-600 mt-2">
                Thank you for your payment. Your booking is being processed.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {loading && <p>Loading booking details...</p>}

              {!loading && error && (
                <p className="text-red-500 font-medium">{error}</p>
              )}

              {!loading && booking && (
                <div className="text-left text-sm text-gray-700 space-y-1">
                  <p><strong>Guest:</strong> {booking.guest_name}</p>
                  <p><strong>Email:</strong> {booking.guest_email}</p>
                  <p><strong>Phone:</strong> {booking.guest_phone}</p>
                  <p><strong>Status:</strong> {booking.status}</p>
                  <p><strong>Check-in:</strong> {new Date(booking.start_date).toLocaleDateString()}</p>
                  <p><strong>Check-out:</strong> {new Date(booking.end_date).toLocaleDateString()}</p>
                  <p><strong>Reference:</strong> {booking.reference}</p>
                </div>
              )}

              <div className="flex gap-3 justify-center pt-4">
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
