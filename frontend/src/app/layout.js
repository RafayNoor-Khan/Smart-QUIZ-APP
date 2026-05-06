import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'QuizApp',
  description: 'Create quizzes and track student progress',
};

// ✅ ADD THIS (fixes mobile responsiveness)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} bg-gradient-to-b from-blue-50 via-white to-blue-50 m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}