const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rs = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-LK');

const STATUS_TEXT = {
  placed: 'We have received your order.',
  preparing: 'Our bakers have started on your cake.',
  out_for_delivery: 'Your cake is on its way.',
  delivered: 'Your cake has been delivered. Enjoy!',
  cancelled: 'Your order has been cancelled.',
};

const wrap = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2b2730">
    <h2 style="color:#b0627c;margin-bottom:4px">TastTrack</h2>
    <h3 style="margin-top:0">${esc(title)}</h3>
    ${body}
    <p style="color:#7a737f;font-size:13px;margin-top:28px">Thank you for choosing TastTrack.</p>
  </div>`;

const itemRows = (order) =>
  order.items.map((i) => `<li>${i.qty} × ${esc(i.name)} (${esc(i.size)}${i.flavour ? ', ' + esc(i.flavour) : ''})${i.message ? ` "${esc(i.message)}"` : ''}</li>`).join('');

export function orderPlacedEmail(order) {
  const pay = order.paymentMethod === 'cod' ? 'Cash on delivery' : `Online payment (${order.paymentStatus})`;
  return {
    to: order.customer.email,
    subject: `Order ${order.orderNo} received`,
    text: `Hi ${order.customer.name}, we received order ${order.orderNo}. Total ${rs(order.total)}. Payment: ${pay}.`,
    html: wrap(
      `Thank you, ${order.customer.name.split(' ')[0]}!`,
      `<p>We received your order <strong>${esc(order.orderNo)}</strong>.</p>
       <ul>${itemRows(order)}</ul>
       <p>Delivery on <strong>${new Date(order.deliveryDate).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</strong> to ${esc(order.customer.address)}, ${esc(order.customer.city)}.</p>
       <p>Total: <strong>${rs(order.total)}</strong><br/>Payment: ${esc(pay)}</p>
       <p>You can track it any time with your order number and phone number.</p>`
    ),
  };
}

export function orderStatusEmail(order) {
  const line = STATUS_TEXT[order.status] || 'Your order status changed.';
  return {
    to: order.customer.email,
    subject: `Order ${order.orderNo}: ${line}`,
    text: `Order ${order.orderNo}: ${line}`,
    html: wrap(`Update on order ${order.orderNo}`, `<p>${esc(line)}</p><ul>${itemRows(order)}</ul>`),
  };
}

export function paymentReceivedEmail(order) {
  return {
    to: order.customer.email,
    subject: `Payment received for order ${order.orderNo}`,
    text: `We received your payment of ${rs(order.total)} for order ${order.orderNo}.`,
    html: wrap('Payment received', `<p>We received your payment of <strong>${rs(order.total)}</strong> for order <strong>${esc(order.orderNo)}</strong>.</p>`),
  };
}

export function passwordResetEmail(user, link) {
  return {
    to: user.email,
    subject: 'Reset your TastTrack password',
    text: `Use this link to choose a new password (valid for 1 hour): ${link}`,
    html: wrap(
      'Reset your password',
      `<p>Hi ${esc(user.name)}, click the button to choose a new password. The link works for 1 hour.</p>
       <p><a href="${esc(link)}" style="background:#b0627c;color:#fff;padding:10px 22px;border-radius:999px;text-decoration:none">Choose a new password</a></p>
       <p style="color:#7a737f;font-size:13px">If you did not ask for this, you can ignore this email.</p>`
    ),
  };
}
