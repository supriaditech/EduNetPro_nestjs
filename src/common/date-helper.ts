export function getCurrentUtcTime(): number {
  return Date.now(); // Pastikan ini mengembalikan tipe number, bukan bigint.
}

// export const convertToLocalTime = (timestamp: number) => {
//   const date = new Date(timestamp);
//   // Local timezone (Western Indonesia: UTC+7)
//   return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString();
// };

// Mengonversi timestamp (millisecond) ke waktu lokal dalam zona waktu UTC+07:00
export default function convertToLocalTime(timestamp: number) {
  const date = new Date(timestamp); // Mengonversi timestamp ke objek Date
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short', // Menampilkan nama hari (misalnya: "Mon", "Tue", dll.)
    year: 'numeric',
    month: 'short', // Menampilkan nama bulan (misalnya: "Jan", "Feb", dll.)
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Menampilkan waktu dalam format 24 jam
    timeZone: 'Asia/Jakarta', // Zona waktu WIB (UTC+07:00)
  };
  return date.toLocaleString('en-GB', options); // Mengonversi ke format string dengan zona waktu lokal
}
