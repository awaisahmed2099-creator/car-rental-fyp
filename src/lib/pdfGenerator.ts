import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '@/types';
import { format } from 'date-fns';

export function generateInvoice(booking: Booking): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPosition = 15;

  // Header with company name and invoice title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text('DRIVEEASE', 15, yPosition);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', pageWidth - 15, yPosition, { align: 'right' });
  
  yPosition += 12;

  // Horizontal divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  
  yPosition += 8;

  // Company info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('DriveEase Car Rental', 15, yPosition);
  yPosition += 5;
  doc.text('Phone: +92-300-1234567', 15, yPosition);
  yPosition += 5;
  doc.text('Address: Karachi, Pakistan', 15, yPosition);
  
  yPosition += 10;

  // Customer info box
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(15, yPosition - 2, pageWidth - 30, 30);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CUSTOMER INFORMATION', 17, yPosition);
  
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${booking.customerName}`, 17, yPosition);
  yPosition += 4;
  doc.text(`Phone: ${booking.customerPhone}`, 17, yPosition);
  yPosition += 4;
  doc.text(`Email: ${booking.customerEmail || 'N/A'}`, 17, yPosition);
  
  yPosition += 10;

  // Booking details
  const bookingDetails: [string, string][] = [
    ['Booking ID', `DR-${booking.bookingId.substring(0, 6).toUpperCase()}`],
    ['Vehicle', booking.carName],
    ['Start Date', format(new Date(booking.startDate), 'dd MMM yyyy')],
    ['End Date', format(new Date(booking.endDate), 'dd MMM yyyy')],
    ['Days', booking.totalDays.toString()],
  ];

  if (booking.packageName) {
    bookingDetails.push(['Package', booking.packageName]);
  }

  bookingDetails.push(
    ['Pickup Location', booking.pickupLocation],
    ['Dropoff Location', booking.dropoffLocation]
  );

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Details']],
    body: bookingDetails,
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: pageWidth - 90 },
    },
    margin: 15,
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Amount section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Amount Details:', 15, yPosition);
  
  yPosition += 8;

  const amountData: [string, string][] = [
    ['Total Amount', `Rs. ${booking.totalAmount.toLocaleString()}`],
    ['Payment Method', booking.paymentMethod === 'cash' ? 'Cash' : 'JazzCash'],
    ['Payment Status', booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)],
  ];

  if (booking.txnRefNo) {
    amountData.push(['Transaction ID', booking.txnRefNo]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Item', 'Value']],
    body: amountData,
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: pageWidth - 110 },
    },
    margin: 15,
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Notes if available
  if (booking.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Notes:', 15, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const notesText = doc.splitTextToSize(booking.notes, pageWidth - 30);
    doc.text(notesText, 15, yPosition);
    yPosition += 10;
  }

  // Footer
  yPosition = pageHeight - 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Thank you for choosing DriveEase!',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated on ${format(new Date(), 'dd MMM yyyy HH:mm:ss')}`,
    pageWidth / 2,
    yPosition + 5,
    { align: 'center' }
  );

  // Download
  doc.save(`DriveEase-Invoice-${booking.bookingId}.pdf`);
}

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
