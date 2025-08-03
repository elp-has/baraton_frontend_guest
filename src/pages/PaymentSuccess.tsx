import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      // Redirect to detailed booking page
      navigate(`/booking/${reference}`);
    }
  }, [reference, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Navigation />
      <div className="text-center mt-32">
        <p className="text-xl text-gray-600">Redirecting to your booking...</p>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
