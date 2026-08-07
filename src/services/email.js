const nodemailer = require('nodemailer');

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === '1',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return cachedTransporter;
}

const STATUS_COPY = {
  confirmed: {
    subject: (code) => `Your booking ${code} is confirmed`,
    body: (booking) =>
      `Good news! Your booking ${booking.booking_code} for ${booking.room_name} (${booking.check_in} to ${booking.check_out}) is confirmed.`
  },
  cancelled: {
    subject: (code) => `Your booking ${code} was cancelled`,
    body: (booking) =>
      `Your booking ${booking.booking_code} for ${booking.room_name} (${booking.check_in} to ${booking.check_out}) has been cancelled. Contact us if this was unexpected.`
  },
  paid: {
    subject: (code) => `Payment received for booking ${code}`,
    body: (booking) =>
      `We have marked your booking ${booking.booking_code} as paid. Total: ${booking.total_in_currency} ${booking.currency_code}.`
  }
};

async function sendBookingStatusEmail(booking, statusKey) {
  const copy = STATUS_COPY[statusKey];
  if (!copy || !booking?.guest_email) return { sent: false, reason: 'unsupported_status_or_missing_email' };

  if (!isConfigured()) {
    console.log(`[email] SMTP not configured, skipping "${statusKey}" email for booking ${booking.booking_code}.`);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: booking.guest_email,
      subject: copy.subject(booking.booking_code),
      text: `${copy.body(booking)}\n\nView your receipt: ${process.env.PUBLIC_BASE_URL || ''}/receipt/${booking.booking_code}`
    });
    return { sent: true };
  } catch (error) {
    console.error('[email] Failed to send booking status email:', error.message);
    return { sent: false, reason: 'send_failed' };
  }
}

function formatPaymentOption(option) {
  return String(option || 'pay_on_arrival')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function sendNewBookingNotification(booking) {
  const recipient = process.env.BOOKING_NOTIFICATION_EMAIL || 'adamurobert@gmail.com';

  if (!isConfigured()) {
    console.log(`[email] SMTP not configured, skipping new-booking notification for ${booking.booking_code}.`);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: recipient,
      subject: `New booking request: ${booking.booking_code}`,
      text: [
        `A new booking request was submitted on Bomagawani.com.`,
        '',
        `Booking code: ${booking.booking_code}`,
        `Room: ${booking.room_name}`,
        booking.offer_name ? `Offer: ${booking.offer_name} (priced per this offer, not the room's nightly rate)` : null,
        `Dates: ${booking.check_in} to ${booking.check_out} (${booking.nights} night(s))`,
        `Guests: ${booking.guests_count}`,
        `Total: ${booking.total_in_currency} ${booking.currency_code}`,
        `Payment option: ${formatPaymentOption(booking.payment_option)}`,
        '',
        `Guest name: ${booking.guest_name}`,
        `Guest email: ${booking.guest_email}`,
        `Guest phone: ${booking.guest_phone}`,
        booking.note ? `Note: ${booking.note}` : null,
        '',
        `Confirm or manage this booking in the admin panel: ${process.env.PUBLIC_BASE_URL || ''}/admin`
      ]
        .filter((line) => line !== null)
        .join('\n')
    });
    return { sent: true };
  } catch (error) {
    console.error('[email] Failed to send new-booking notification:', error.message);
    return { sent: false, reason: 'send_failed' };
  }
}

module.exports = {
  isConfigured,
  sendBookingStatusEmail,
  sendNewBookingNotification
};
