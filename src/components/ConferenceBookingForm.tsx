import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarDays,
  Users,
  Mail,
  Phone,
  User,
  NotebookPen,
  CreditCard,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  validateEmail,
  validatePhone,
  sanitizeInput,
  validateAmount,
  validateGuestCount,
  validateDateRange,
} from '@/utils/security';
import PaystackPayment from '@/components/PaystackPayment';

type ConferenceBookingFormProps = {
  conferenceId: number;
  roomName: string;
};

const ConferenceBookingForm: React.FC<ConferenceBookingFormProps> = ({ conferenceId, roomName }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [dates, setDates] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState(0);

  const validateInputs = () => {
    if (!validateEmail(email)) {
      toast({ title: 'Invalid Email', description: 'Enter a valid email address.', variant: 'destructive' });
      return false;
    }
    if (!validatePhone(phone)) {
      toast({ title: 'Invalid Phone', description: 'Enter a valid phone number.', variant: 'destructive' });
      return false;
    }
    if (!validateDateRange(dates.from, dates.to)) {
      toast({ title: 'Invalid Dates', description: 'Start and end dates are required.', variant: 'destructive' });
      return false;
    }
    if (!validateAmount(amount)) {
      toast({ title: 'Invalid Amount', description: 'Enter a valid payment amount.', variant: 'destructive' });
      return false;
    }
    if (!validateGuestCount(guests)) {
      toast({ title: 'Invalid Guests', description: 'Enter a valid guest count.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const bookingData = {
    room_id: conferenceId,
    roomName,
    email: sanitizeInput(email),
    phone: sanitizeInput(phone),
    fullName: sanitizeInput(fullName),
    guests,
    check_in: dates.from?.toISOString(),
    check_out: dates.to?.toISOString(),
    notes: sanitizeInput(notes),
    type: 'conference',
  };

  return (
    <div className="grid grid-cols-1 gap-4 text-sm animate-fade-in">
      <div>
        <Label className="mb-1">Full Name</Label>
        <div className="flex items-center border rounded-md px-3 py-2">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="border-0 p-0 focus-visible:ring-0" />
        </div>
      </div>

      <div>
        <Label className="mb-1">Email Address</Label>
        <div className="flex items-center border rounded-md px-3 py-2">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="border-0 p-0 focus-visible:ring-0" />
        </div>
      </div>

      <div>
        <Label className="mb-1">Phone Number</Label>
        <div className="flex items-center border rounded-md px-3 py-2">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="border-0 p-0 focus-visible:ring-0" />
        </div>
      </div>

      <div>
        <Label className="mb-1">Event Dates</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left">
              <CalendarDays className="mr-2 h-4 w-4" />
              {dates.from && dates.to ? `${format(dates.from, 'PPP')} - ${format(dates.to, 'PPP')}` : 'Pick a date range'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="range" selected={dates} onSelect={setDates} numberOfMonths={2} />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="mb-1">Participants</Label>
        <div className="flex items-center border rounded-md px-3 py-2">
          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input type="number" value={guests} onChange={(e) => setGuests(Number(e.target.value))} min={1} className="border-0 p-0 focus-visible:ring-0" />
        </div>
      </div>

      <div>
        <Label className="mb-1">Additional Notes</Label>
        <div className="flex items-start border rounded-md px-3 py-2">
          <NotebookPen className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Require projector or refreshments" className="border-0 p-0 focus-visible:ring-0 resize-none" />
        </div>
      </div>

      <div>
        <Label className="mb-1">Amount (KES)</Label>
        <div className="flex items-center border rounded-md px-3 py-2">
          <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1000} className="border-0 p-0 focus-visible:ring-0" />
        </div>
      </div>

      <PaystackPayment
        email={email}
        amount={amount}
        bookingData={bookingData}
        onSuccess={() => toast({
          title: 'Booking Successful',
          description: 'Your conference booking has been received!',
        })}
        onError={() => toast({
          title: 'Payment Failed',
          description: 'There was a problem with the payment.',
          variant: 'destructive',
        })}
        validateBeforePay={validateInputs}
      />
    </div>
  );
};

export default ConferenceBookingForm;
