import PDFDocument from 'pdfkit';

const rs = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-LK');


export function streamInvoice(order, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNo}.pdf"`);
  doc.pipe(res);

  const ink = '#2b2730';
  const muted = '#7a737f';
  const rose = '#b0627c';

  doc.fillColor(rose).fontSize(26).text('TastTrack', 50, 50);
  doc.fillColor(muted).fontSize(10).text('Fresh cakes, delivered', 50, 80);
  doc.fillColor(ink).fontSize(20).text('INVOICE', 380, 50, { width: 165, align: 'right' });
  doc.fillColor(muted).fontSize(10)
    .text(`No: ${order.orderNo}`, 380, 78, { width: 165, align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })}`, 380, 92, { width: 165, align: 'right' });

  doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#ebe6e9').stroke();

  doc.fillColor(muted).fontSize(9).text('BILL TO / DELIVER TO', 50, 135);
  doc.fillColor(ink).fontSize(11)
    .text(order.customer.name, 50, 150)
    .text(order.customer.phone)
    .text(`${order.customer.address}, ${order.customer.city}`, { width: 250 });

  doc.fillColor(muted).fontSize(9).text('DELIVERY DATE', 380, 135);
  doc.fillColor(ink).fontSize(11).text(new Date(order.deliveryDate).toLocaleDateString('en-LK', { dateStyle: 'long' }), 380, 150);
  doc.fillColor(muted).fontSize(9).text('PAYMENT', 380, 175);
  doc.fillColor(ink).fontSize(11).text(order.paymentMethod === 'cod' ? 'Cash on delivery' : `Online (${order.paymentStatus})`, 380, 190);

  
  let y = 250;
  const header = () => {
    doc.fillColor(muted).fontSize(9)
      .text('ITEM', 50, y).text('QTY', 350, y, { width: 40, align: 'right' })
      .text('PRICE', 400, y, { width: 65, align: 'right' }).text('AMOUNT', 470, y, { width: 75, align: 'right' });
    doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor('#ebe6e9').stroke();
    y += 24;
  };
  header();

  for (const i of order.items) {
    if (y > 700) {
      doc.addPage();
      y = 60;
      header();
    }
    const label = `${i.name} (${i.size}${i.flavour ? ', ' + i.flavour : ''})`;
    doc.fillColor(ink).fontSize(10).text(label, 50, y, { width: 290 });
    let h = doc.heightOfString(label, { width: 290 });
    if (i.message) {
      doc.fillColor(muted).fontSize(9).text(`Message: "${i.message}"`, 50, y + h, { width: 290 });
      h += 12;
    }
    doc.fillColor(ink).fontSize(10)
      .text(String(i.qty), 350, y, { width: 40, align: 'right' })
      .text(rs(i.price), 400, y, { width: 65, align: 'right' })
      .text(rs(i.price * i.qty), 470, y, { width: 75, align: 'right' });
    y += h + 10;
  }

  doc.moveTo(300, y).lineTo(545, y).strokeColor('#ebe6e9').stroke();
  y += 10;
  const row = (label, value, bold = false) => {
    doc.fillColor(bold ? ink : muted).fontSize(bold ? 12 : 10).text(label, 300, y, { width: 120 }).text(value, 420, y, { width: 125, align: 'right' });
    y += bold ? 22 : 18;
  };
  row('Subtotal', rs(order.itemsTotal));
  if (order.discount > 0) row(`Coupon ${order.couponCode || ''}`, `- ${rs(order.discount)}`);
  row('Delivery', order.deliveryFee ? rs(order.deliveryFee) : 'Free');
  row('Total', rs(order.total), true);

  doc.fillColor(muted).fontSize(9).text('Thank you for your order.', 50, y + 30, { width: 495, align: 'center' });
  doc.end();
}
