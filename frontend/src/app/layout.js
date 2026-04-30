import Navbar from '@/components/common/Navbar';
import './globals.css';

export const metadata = {
  title: 'QuizHub - AI Quiz Platform',
  description: 'Create and take quizzes with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}