import { motion } from "motion/react";
import { Heart, LogOut, ChevronLeft } from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";
import { useAuth } from "./hooks/useAuth";
import RoleSelection from "./components/RoleSelection";
import PinModal from "./components/PinModal";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentAttendance from "./components/StudentAttendance";
import TeacherReport from "./components/TeacherReport";
import BookingPage from "./components/BookingPage";
import AdminDashboard from "./components/AdminDashboard";
import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

function MainPortal() {
  const { user, isLoading } = useAuthStore();
  const { loginWithGoogle, handleSignOut } = useAuth();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'selection' | 'teacher' | 'student' | 'booking' | 'admin'>('selection');
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      setIsPinModalOpen(true);
    } else {
      setCurrentView('student');
      // In a real app, students might scan a QR code which leads to /student
      // But we can also show a placeholder or redirect
    }
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setCurrentView('teacher');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-soft">
        <div className="w-12 h-12 border-4 border-brand-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-brand-soft">
        {/* Background Decor */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-pink-200 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] opacity-50" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 w-full max-w-[400px] px-6 text-center"
        >
          {/* Logo/Icon Section */}
          <div className="mb-12 relative flex justify-center">
            <div className="w-64 h-64 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-xl flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border border-pink-200 rounded-full animate-pulse" />
                  <div className="absolute w-32 h-32 border border-pink-300 rounded-full" />
                  <div className="absolute w-16 h-16 bg-pink-500 rounded-full shadow-lg shadow-pink-200 flex items-center justify-center">
                    <Heart className="text-white w-8 h-8 fill-current" />
                  </div>
               </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Smart Campus <span className="text-pink-600">RBRU</span>
          </h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            จัดการการจองห้องประชุมและเช็คชื่อเข้าเรียน <br/> 
            ง่าย ครบ จบในที่เดียวด้วยอีเมลองค์กร
          </p>

          <div className="space-y-4">
            <button
              onClick={loginWithGoogle}
              className="w-full py-4 bg-white text-slate-700 font-semibold rounded-full shadow-sm border border-slate-100 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
              Sign in with Google (@rbru.ac.th)
            </button>
            
            <button
              onClick={loginWithGoogle}
              className="w-full py-4 bg-pink-600 text-white font-bold rounded-full shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95 uppercase tracking-wider text-sm"
            >
              Let's Go
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-soft relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-pink-200 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          {currentView !== 'selection' && (
            <button 
              onClick={() => setCurrentView('selection')}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-main transition-colors shadow-sm mr-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="w-12 h-12 bg-brand-main rounded-2xl flex items-center justify-center shadow-lg shadow-brand-main/20">
            <Heart className="text-white w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">Smart Campus</h2>
            <p className="text-xs font-medium text-brand-main uppercase tracking-widest">RBRU Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user.role === 'admin' && (
            <button 
              onClick={() => setCurrentView('admin')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                currentView === 'admin' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
              }`}
            >
              Admin
            </button>
          )}
          <button 
            onClick={() => setCurrentView('booking')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              currentView === 'booking' ? 'bg-brand-main text-white' : 'bg-white/40 text-slate-600 hover:bg-white/60'
            }`}
          >
            จองห้องประชุม
          </button>
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-2 pl-4 rounded-full border border-white/50">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user.displayName}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{user.role || 'User'}</p>
            </div>
            <img 
              src={user.photoURL || ""} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-brand-main/20"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={handleSignOut}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-pink-600 transition-colors shadow-sm"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {currentView === 'selection' && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                ยินดีต้อนรับเข้าสู่ระบบ
              </h1>
              <p className="text-slate-500 text-lg">กรุณาเลือกประเภทการใช้งานเพื่อดำเนินการต่อ</p>
            </motion.div>
            <RoleSelection onSelect={handleRoleSelect} />
          </>
        )}

        {currentView === 'teacher' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <TeacherDashboard />
          </motion.div>
        )}

        {currentView === 'student' && (
          <div className="text-center p-12 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white max-w-md">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">ระบบนักศึกษา</h2>
            <p className="text-slate-500">กรุณาสแกน QR Code จากอาจารย์เพื่อเช็คชื่อเข้าเรียน</p>
            <button 
              onClick={() => setCurrentView('selection')}
              className="mt-8 px-8 py-3 bg-brand-main text-white rounded-full font-bold shadow-lg shadow-brand-main/20"
            >
              กลับหน้าหลัก
            </button>
          </div>
        )}

        {currentView === 'booking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <BookingPage />
          </motion.div>
        )}

        {currentView === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <AdminDashboard />
          </motion.div>
        )}
      </main>

      <PinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={handlePinSuccess} 
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPortal />} />
        <Route path="/student" element={<StudentAttendance />} />
        <Route path="/report" element={<TeacherReport />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
