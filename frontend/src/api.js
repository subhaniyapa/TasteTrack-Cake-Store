const BASE = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const money = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-LK');


export async function uploadImage(file, token) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(BASE + '/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.url;
}


export const assetUrl = (u) => {
  if (!u || !u.startsWith('/uploads') || !import.meta.env.VITE_API_URL) return u;
  return new URL(import.meta.env.VITE_API_URL, window.location.origin).origin + u;
};


export async function downloadInvoice(order, { token, phone } = {}) {
  const q = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const res = await fetch(`${BASE}/orders/${order._id}/invoice${q}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.message || 'Could not download the invoice');
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${order.orderNo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
