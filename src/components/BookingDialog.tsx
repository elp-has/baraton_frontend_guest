import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Users, Mail, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaystackPayment from './PaystackPayment';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { validateEmail, validatePhone, sanitizeInput, validateAmount, validateGuestCount, validateDateRange } from '@/utils/security';

type Room = {
  id: string;
  name: string;
  type: string;
  description: string;
  price_per_night: number;
  price_per_hour?: number;
  image_url?: string;
  amenities?: string[];
  capacity: number;
  size_sqm?: number;
  created_at?: string;
  updated_at?: string;
  is_available?: boolean;
  room_number?: string;
};

interface BookingDialogProps {
  room: Room;
  children: React.ReactNode;
}

const BookingDialog = ({ room, children }: BookingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!checkInDate || !checkOutDate) {
      newErrors.dates = 'Please select both check-in and check-out dates';
    } else if (!validateDateRange(checkInDate.toISOString().split('T')[0], checkOutDate.toISOString().split('T')[0])) {
      newErrors.dates = 'Invalid date range';
    }

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    } else if (formData.guestName.trim().length < 2) {
      newErrors.guestName = 'Name must be at least 2 characters';
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email is required';
    } else if (!validateEmail(formData.guestEmail)) {
      newErrors.guestEmail = 'Invalid email';
    }

    if (formData.guestPhone && !validatePhone(formData.guestPhone)) {
      newErrors.guestPhone = 'Invalid phone number';
    }

    if (!validateGuestCount(Number(formData.guests), room.capacity)) {
      newErrors.guests = `Guests must be 1 to ${room.capacity}`;
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
    return calculateNights() * room.price_per_night;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'guests' ? Number(value) : sanitizeInput(String(value))
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBookingSuccess = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the form errors.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const totalAmount = calculateTotal();
      const isConference = room.type?.toLowerCase().includes('conference');
      const bookingPayload: any = {
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
      if (!paymentRes.ok) throw new Error('Payment initiation failed');

      toast({ title: "Booking Successful", description: "Complete payment to confirm your booking." });

      setIsOpen(false);
      setFormData({ guests: 1, guestName: '', guestEmail: '', guestPhone: '', specialRequests: '' });
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setErrors({});
    } catch (error) {
      console.error('Booking error:', error);
      toast({ title: "Booking Error", description: "Please try again or contact support.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () =>
    checkInDate &&
    checkOutDate &&
    formData.guestName.trim() &&
    validateEmail(formData.guestEmail) &&
    calculateNights() > 0 &&
    Object.keys(errors).length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-hotel-navy">Book {room.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger>
                      <button className="w-full text-left px-4 py-2 border rounded-md bg-white">
                        {checkInDate ? format(checkInDate, 'PPP') : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        disabled={date => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger>
                      <button className="w-full text-left px-4 py-2 border rounded-md bg-white">
                        {checkOutDate ? format(checkOutDate, 'PPP') : 'Select date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        disabled={date => !checkInDate || date <= checkInDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {errors.dates && <p className="text-red-500 text-sm">{errors.dates}</p>}

              <div>
                <Label>Number of Guests</Label>
                <Input
                  type="number"
                  min="1"
                  max={room.capacity}
                  value={formData.guests}
                  onChange={e => handleInputChange('guests', e.target.value)}
                  className={errors.guests ? 'border-red-500' : ''}
                />
                {errors.guests && <p className="text-sm text-red-500">{errors.guests}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.guestName}
                    onChange={e => handleInputChange('guestName', e.target.value)}
                    className={errors.guestName ? 'border-red-500' : ''}
                  />
                  {errors.guestName && <p className="text-sm text-red-500">{errors.guestName}</p>}
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.guestEmail}
                    onChange={e => handleInputChange('guestEmail', e.target.value)}
                    className={errors.guestEmail ? 'border-red-500' : ''}
                  />
                  {errors.guestEmail && <p className="text-sm text-red-500">{errors.guestEmail}</p>}
                </div>
              </div>

              <div>
                <Label>Phone (Optional)</Label>
                <Input
                  value={formData.guestPhone}
                  onChange={e => handleInputChange('guestPhone', e.target.value)}
                />
              </div>

              <div>
                <Label>Special Requests</Label>
                <Textarea
                  value={formData.specialRequests}
                  onChange={e => handleInputChange('specialRequests', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              {calculateNights() > 0 && (
                <div className="bg-hotel-cream p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Room:</span><span>{room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span><span>{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span><span>KSh {(room.price_per_night / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span><span>KSh {(calculateTotal() / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {isFormValid() && (
                <PaystackPayment
                  amount={calculateTotal()}
                  email={formData.guestEmail}
                  bookingData={formData}
                  onSuccess={handleBookingSuccess}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
