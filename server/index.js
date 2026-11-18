import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Muat .env dari folder server/
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Inisialisasi Transporter Gmail SMTP
const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Helper HTML Template Generator untuk UniSphere
const generateEmailHtml = ({ title, contentHtml, studentName }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F7FD; margin: 0; padding: 24px; color: #1e293b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.08); border: 1px solid #ede9fe; }
      .header { background: linear-gradient(135deg, #7e22ce, #6366f1); padding: 32px 28px; text-align: left; color: #ffffff; }
      .brand { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; margin: 0; display: flex; align-items: center; gap: 8px; }
      .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #e9d5ff; font-weight: 700; margin-top: 4px; }
      .title { font-size: 18px; font-weight: 800; margin: 16px 0 0 0; color: #ffffff; }
      .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 16px 0; }
      .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 9999px; background: #ede9fe; color: #6b21a8; }
      .footer { background: #fdfdfd; border-top: 1px solid #f1f5f9; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; }
      .btn { display: inline-block; background: #7e22ce; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; font-size: 12px; margin-top: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">🎓 UniSphere</div>
        <div class="brand-sub">Student Academic Portal</div>
        <div class="title">${title}</div>
      </div>
      <div class="content">
        <p>Halo <strong>${studentName || 'Mahasiswa'}</strong>,</p>
        ${contentHtml}
      </div>
      <div class="footer">
        Email ini dikirim otomatis oleh sistem notifikasi akademik <strong>UniSphere Portal</strong>.<br>
        Pengirim: ${emailUser || 'Akademik Kampus'} &bull; ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  </body>
  </html>
  `;
};

// 1. Health check & status endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (!emailUser || !emailPass) {
      return res.status(200).json({
        status: 'warning',
        message: 'Server aktif, namun EMAIL_USER atau EMAIL_PASS belum disetel di server/.env',
        configured: false
      });
    }

    // Verifikasi koneksi SMTP
    await transporter.verify();
    res.status(200).json({
      status: 'ready',
      message: 'SMTP Gmail terhubung dan siap mengirim email!',
      sender: emailUser,
      configured: true
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal terhubung ke SMTP Gmail: ' + err.message,
      configured: false
    });
  }
});

// 2. Endpoint kirim email
app.post('/api/send-email', async (req, res) => {
  const { to, type, subject, message, studentData } = req.body;

  if (!to || !to.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Alamat email penerima tidak valid!'
    });
  }

  try {
    let emailSubject = subject || 'Pemberitahuan Akademik UniSphere';
    let htmlContent = '';
    const studentName = studentData?.name || 'Mahasiswa UniSphere';

    // Pilihan template berdasarkan tipe
    if (type === 'digest') {
      emailSubject = `📊 [UniSphere] Ringkasan Akademik Mingguan - ${studentName}`;
      htmlContent = `
        <p>Berikut adalah ringkasan status akademik aktif Anda di semester ini:</p>
        <div class="card">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #64748b;">NIM:</td><td style="font-weight: bold; text-align: right;">${studentData?.nim || '220010984'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Program Studi:</td><td style="font-weight: bold; text-align: right;">${studentData?.major || 'Computer Science'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Indeks Prestasi Kumulatif (IPK):</td><td style="font-weight: bold; text-align: right; color: #16a34a;">${studentData?.cgpa || '3.78 / 4.00'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Persentase Kehadiran:</td><td style="font-weight: bold; text-align: right; color: #7e22ce;">${studentData?.attendanceRate || '93.5%'}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Tugas Menunggu:</td><td style="font-weight: bold; text-align: right; color: #eab308;">${studentData?.pendingTasks || '3'} Tugas Aktif</td></tr>
          </table>
        </div>
        <p>Tetap pertahankan performa belajar Anda! Silakan akses portal untuk melihat detail silabus dan pengumpulan tugas.</p>
      `;
    } else if (type === 'exam_slip') {
      emailSubject = `📋 [UniSphere] Kartu Tanda Peserta Ujian (UTS) - ${studentName}`;
      htmlContent = `
        <p>Kartu Tanda Peserta Ujian Tengah Semester (UTS) Anda telah diterbitkan secara elektronik.</p>
        <div class="card">
          <div style="font-weight: bold; margin-bottom: 8px; color: #1e293b;">Detail Kursi & Ruang Ujian:</div>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #64748b;">Nomor Kursi:</td><td style="font-weight: bold; text-align: right; color: #7e22ce;">C-14 (Lab Komputer 3)</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Status Kelayakan:</td><td style="font-weight: bold; text-align: right; color: #16a34a;">Eligible / Memenuhi Syarat (93.5%)</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Total Mata Kuliah Ujian:</td><td style="font-weight: bold; text-align: right;">6 Mata Kuliah</td></tr>
          </table>
        </div>
        <p style="font-size: 12px; color: #64748b;">Harap hadir 15 menit sebelum ujian dimulai dan membawa Kartu Tanda Mahasiswa (KTM) yang sah.</p>
      `;
    } else {
      // Custom / pesan langsung
      htmlContent = `
        <div class="card">
          <p style="margin: 0; white-space: pre-wrap;">${message || 'Tidak ada pesan tertulis.'}</p>
        </div>
      `;
    }

    const fullHtml = generateEmailHtml({
      title: emailSubject,
      studentName,
      contentHtml: htmlContent
    });

    const mailOptions = {
      from: `"UniSphere Portal" <${emailUser}>`,
      to: to.trim(),
      subject: emailSubject,
      text: message || `Pemberitahuan UniSphere untuk ${studentName}`,
      html: fullHtml
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Email berhasil dikirim ke ${to}!`,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error saat mengirim email:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim email: ' + error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 UniSphere Email Server berjalan di http://localhost:${PORT}`);
  console.log(`📧 Pengirim: ${emailUser || '(belum disetel)'}`);
});
