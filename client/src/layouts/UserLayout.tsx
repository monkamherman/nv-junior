import { FaqChatbot } from '@/components/faq/FaqChatbot';
import { Outlet } from 'react-router-dom';
import Navbar from '@/layouts/navbar/Header';
import Footer from '@/layouts/footer/Footer';

export function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <div className="min-h-[80vh]">
          <Outlet />
        </div>
      </main>
      <FaqChatbot />
      <Footer />
    </div>
  );
}

export default UserLayout;
