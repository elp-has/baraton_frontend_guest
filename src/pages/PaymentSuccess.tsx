import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const reference = searchParams.get('reference');

  useEffect(() => {
    // Simulate a short loading period
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing your payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                Thank you for your payment. We are now processing your booking.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-gray-700">
                You will receive a confirmation email shortly once your booking is finalized.
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
