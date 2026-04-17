import { jsPDF } from 'jspdf';
import { Booking } from '@/types';
import { format } from 'date-fns';

export function generateBookingReceipt(booking: Booking): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPosition = 15;

  // Logo/Header
  doc.setFontSize(24);
  doc.setTextColor(249, 115, 22); // Orange color
  doc.text('DriveEase', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('BOOKING RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  
  yPosition += 8;

  // Booking Details
  doc.setFontSize(11);
  const details = [
    {
      label: 'Booking ID',
      value: `DR-${booking.bookingId.substr(0, 6).toUpperCase()}`,
    },
    {
      label: 'Customer Name',
      value: booking.customerName,
    },
    {
      label: 'Phone Number',
      value: booking.customerPhone,
    },
    {
      label: 'Email',
      value: booking.customerEmail || 'N/A',
    },
    {
      label: 'Vehicle',
      value: booking.carName,
    },
    {
      label: 'Package',
      value: booking.packageName || 'Standard Rental',
    },
    {
      label: 'Start Date',
      value: format(new Date(booking.startDate), 'dd MMM yyyy'),
    },
    {
      label: 'End Date',
      value: format(new Date(booking.endDate), 'dd MMM yyyy'),
    },
    {
      label: 'Duration',
      value: `${booking.totalDays} days`,
    },
    {
      label: 'Pickup Location',
      value: booking.pickupLocation,
    },
    {
      label: 'Dropoff Location',
      value: booking.dropoffLocation,
    },
  ];

  const labelWidth = 50;
  const valueWidth = pageWidth - 30 - labelWidth;

  details.forEach((detail) => {
    doc.setFont('helvetica', 'bold');
    doc.text(detail.label, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, 15 + labelWidth, yPosition);
    yPosition += 6;
  });

  yPosition += 3;

  // Divider before pricing
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  
  yPosition += 8;

  // Pricing section
  doc.setFontSize(12);
  
  const priceDetails = [
    {
      label: 'Amount',
      value: `PKR ${booking.totalAmount.toLocaleString()}`,
      isBold: false,
    },
    {
      label: 'Payment Method',
      value: booking.paymentMethod === 'cash' ? 'Cash Payment' : 'JazzCash',
      isBold: false,
    },
    {
      label: 'Payment Status',
      value: booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1),
      isBold: true,
    },
  ];

  priceDetails.forEach((detail) => {
    if (detail.isBold) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    }
    doc.text(detail.label, 15, yPosition);
    doc.text(detail.value, pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 7;
  });

  // Footer
  yPosition = pageHeight - 20;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Thank you for choosing DriveEase. Safe travels!',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    yPosition + 5,
    { align: 'center' }
  );

  // Download
  const fileName = `DriveEase-Receipt-${booking.bookingId.substr(0, 6)}.pdf`;
  doc.save(fileName);
}
