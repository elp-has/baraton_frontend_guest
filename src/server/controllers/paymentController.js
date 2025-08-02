import paystack from '../config/paystack.js';
import Payment from '../models/payment.js';
import Booking from '../models/booking.js';
import Lodging from '../models/lodging.js';
import Conference from '../models/conference.js';

export const initiatePayment = async (req, res, next) => {
  try {
    const { amount, email, booking_id } = req.body;
    const response = await paystack.transaction.initialize({
      amount,
      email,
      reference: `BOB-${Date.now()}`,
      callback_url: 'https://baraton-frontend-guest-umber.vercel.app/payment-success?reference={{reference}}'
    });
    const payment = await Payment.create({
      booking_id,
      amount,
      status: 'pending',
      reference: response.data.reference,
    });
    res.json({ ...response.data, payment });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const response = await paystack.transaction.verify(reference);
    let booking = null;
    if (response.data.status === 'success') {
      await Payment.update({ status: 'success' }, { where: { reference } });
      const payment = await Payment.findOne({ where: { reference } });
      if (payment) {
        await Booking.update({ status: 'confirmed' }, { where: { id: payment.booking_id } });
        booking = await Booking.findByPk(payment.booking_id, {
          include: [Lodging, Conference],
        });
      }
    }
    res.json({ ...response.data, booking });
  } catch (err) {
    next(err);
  }
};
