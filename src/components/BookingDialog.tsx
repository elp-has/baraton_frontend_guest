import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Users, Mail, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaystackPayment from './PaystackPayment';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { validateEmail, validatePhone, sanitizeInput, validateAmount, validateDateRange } from '@/utils/security';

const BookingDialog = ({ room, children }: { room: any; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });

  const API_BASE_URL = import.meta.env.VITE_RAILWAY_API_URL || '';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!checkInDate || !checkOutDate) {
      newErrors.dates = 'Please select both check-in and check-out dates';
    } else if (!validateDateRange(checkInDate.toISOString().split('T')[0], checkOutDate.toISOString().split('T')[0])) {
      newErrors.dates = 'Invalid date range. Check-in must be today or later, check-out must be after check-in';
    }

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    } else if (formData.guestName.trim().length < 2) {
      newErrors.guestName = 'Guest name must be at least 2 characters';
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email address is required';
    } else if (!validateEmail(formData.guestEmail)) {
      newErrors.guestEmail = 'Please enter a valid email address';
    }

    if (formData.guestPhone && !validatePhone(formData.guestPhone)) {
      newErrors.guestPhone = 'Please enter a valid Kenyan phone number';
    }

    const totalAmount = calculateTotal();
    if (!validateAmount(totalAmount)) {
      newErrors.amount = 'Invalid booking amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const calculateTotal = () => {
    if (room.type?.toLowerCase().includes('conference')) {
      return room.price_per_hour || room.price_per_night;
    }
    const nights = calculateNights();
    return nights * room.price_per_night;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? sanitizeInput(value) : value
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBookingSuccess = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const totalAmount = calculateTotal();
      const isConference = room.type?.toLowerCase().includes('conference');

      const bookingPayload = {
        start_date: checkInDate!.toISOString().split('T')[0],
        end_date: checkOutDate!.toISOString().split('T')[0],
        reference: `ref_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        guests: Number(formData.guests),
        guest_name: formData.guestName.trim(),
        guest_email: formData.guestEmail.toLowerCase().trim(),
        guest_phone: formData.guestPhone.trim() || null,
        special_requests: formData.specialRequests.trim() || null,
        ...(isConference ? { conference_id: room.id } : { lodging_id: room.id })
      };

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      if (!bookingRes.ok) throw new Error('Failed to create booking');
      const bookingData = await bookingRes.json();

      const paymentUrl = API_BASE_URL
        ? `https://${API_BASE_URL.replace(/^https?:\/\//, '')}/api/payments/initiate`
        : '/api/payments/initiate';

      const paymentRes = await fetch(paymentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingData.id,
          amount: totalAmount,
          email: formData.guestEmail
        })
      });
      if (!paymentRes.ok) throw new Error('Failed to create payment');

      toast({
        title: "Booking Created!",
        description: "Your booking has been created. Please complete payment to confirm."
      });

      setIsOpen(false);
      setFormData({ guests: 1, guestName: '', guestEmail: '', guestPhone: '', specialRequests: '' });
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setErrors({});
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Error",
        description: "There was an error processing your booking. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return checkInDate &&
      checkOutDate &&
      formData.guestName.trim() &&
      validateEmail(formData.guestEmail) &&
      calculateNights() > 0 &&
      Object.keys(errors).length === 0;
  };

  const bookingData = {
    room_id: room.id,
    roomName: room.name,
    guestName: formData.guestName.trim(),
    guestEmail: formData.guestEmail.toLowerCase().trim(),
    guestPhone: formData.guestPhone.trim(),
    checkInDate: checkInDate?.toISOString().split('T')[0],
    checkOutDate: checkOutDate?.toISOString().split('T')[0],
    guests: formData.guests,
    specialRequests: formData.specialRequests.trim()
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-hotel-navy">
            Book {room.name}
          </DialogTitle>
        </DialogHeader>
        {/* Form content remains here */}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
