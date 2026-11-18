export const getEmailApiBaseUrl = (configuredUrl = '') =>
  String(configuredUrl).trim().replace(/\/+$/, '');

const EMAIL_API_BASE_URL = getEmailApiBaseUrl(import.meta.env?.VITE_EMAIL_API_URL);

/**
 * Cek status server email dan koneksi SMTP
 */
export const checkEmailServerStatus = async () => {
  if (!EMAIL_API_BASE_URL) {
    return {
      configured: false,
      status: 'unconfigured',
      message: 'Backend email belum dikonfigurasi. Atur VITE_EMAIL_API_URL lalu build ulang aplikasi.'
    };
  }

  try {
    const res = await fetch(`${EMAIL_API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000) // SMTP verification may take longer on a cold connection.
    });
    if (res.ok) {
      return await res.json();
    }
    return { configured: false, status: 'offline', message: 'Server tidak merespons.' };
  } catch (err) {
    return { configured: false, status: 'offline', message: 'Backend email server belum dinyalakan.' };
  }
};

/**
 * Mengirim email notifikasi akademik via SMTP Gmail
 */
export const sendAcademicEmail = async ({ to, type = 'digest', subject, message, studentData }) => {
  if (!EMAIL_API_BASE_URL) {
    throw new Error('Backend email belum dikonfigurasi. Atur VITE_EMAIL_API_URL lalu build ulang aplikasi.');
  }

  const res = await fetch(`${EMAIL_API_BASE_URL}/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      type,
      subject,
      message,
      studentData
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal mengirim email');
  }
  return data;
};
