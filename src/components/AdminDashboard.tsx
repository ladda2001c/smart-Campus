import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { Check, X, ShieldCheck, Trash2, Calendar, Clock, MapPin, User } from "lucide-react";
import StaffUpload from "./StaffUpload";
import { sendEmailNotification } from "../lib/notification";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'staff'>('bookings');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      
      // Find the booking to get user details for notification
      const booking = bookings.find(b => b.id === id);
      if (booking && booking.userEmail) {
        const subject = `แจ้งผลการจองห้องประชุม: ${booking.title}`;
        const message = status === 'approved' 
          ? `คำขอจองห้อง "${booking.roomName}" ในวันที่ ${booking.date} เวลา ${booking.startTime}-${booking.endTime} น. ของคุณได้รับการ **อนุมัติ** เรียบร้อยแล้ว`
          : `คำขอจองห้อง "${booking.roomName}" ในวันที่ ${booking.date} ของคุณถูก **ปฏิเสธ** กรุณาติดต่อเจ้าหน้าที่เพื่อสอบถามรายละเอียดเพิ่มเติม`;
        
        await sendEmailNotification(booking.userEmail, subject, message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบรายการจองนี้ใช่หรือไม่?")) {
      try {
        await deleteDoc(doc(db, "bookings", id));
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-xl shadow-pink-100 flex items-center justify-center border border-white">
          <ShieldCheck className="text-pink-600" size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ผู้ดูแลระบบ</h1>
          <p className="text-slate-500 font-medium">Smart Campus RBRU Admin Control</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 mb-10 bg-white/40 backdrop-blur-md p-2 rounded-[2rem] w-fit border border-white/50 shadow-sm">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-8 py-4 rounded-[1.5rem] font-bold transition-all flex items-center gap-2 ${
            activeTab === 'bookings' 
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
              : 'text-slate-500 hover:text-pink-600 hover:bg-white/50'
          }`}
        >
          <Calendar size={20} />
          รายการจองห้อง
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`px-8 py-4 rounded-[1.5rem] font-bold transition-all flex items-center gap-2 ${
            activeTab === 'staff' 
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
              : 'text-slate-500 hover:text-pink-600 hover:bg-white/50'
          }`}
        >
          <User size={20} />
          จัดการรายชื่ออาจารย์
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'bookings' ? (
          <motion.div 
            key="bookings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-md p-20 rounded-[3rem] border border-white/50 text-center">
                <p className="text-slate-400 font-medium text-lg">ยังไม่มีรายการจองห้องประชุม</p>
              </div>
            ) : (
              bookings.map((item) => (
                <motion.div 
                  layout 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 group hover:shadow-md transition-all"
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                        item.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {item.status}
                      </span>
                      <h3 className="font-black text-slate-800 text-xl">{item.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-slate-500">
                        <MapPin size={18} className="text-pink-400" />
                        <span className="font-medium">{item.roomName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <Calendar size={18} className="text-pink-400" />
                        <span className="font-medium">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <Clock size={18} className="text-pink-400" />
                        <span className="font-medium">{item.startTime} - {item.endTime} น.</span>
                      </div>
                      <div className="flex items-center gap-3 text-pink-500">
                        <User size={18} />
                        <span className="font-bold text-sm">{item.userName} ({item.userEmail})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-6 lg:pt-0">
                    {item.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(item.id, 'approved')} 
                          className="flex-1 lg:flex-none px-6 py-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 font-bold"
                        >
                          <Check size={20} />
                          อนุมัติ
                        </button>
                        <button 
                          onClick={() => updateStatus(item.id, 'rejected')} 
                          className="flex-1 lg:flex-none px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 flex items-center justify-center gap-2 font-bold"
                        >
                          <X size={20} />
                          ปฏิเสธ
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="p-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="staff"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <StaffUpload />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
