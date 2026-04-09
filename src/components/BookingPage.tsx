import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Calendar, Clock, MapPin, Info, Plus } from "lucide-react";
import BookingModal from "./BookingModal";

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ดึงข้อมูลการจองทั้งหมดมาโชว์
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    }, (error) => {
      console.error("Error fetching bookings:", error);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="py-10 max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ระบบจองห้องประชุม</h1>
          <p className="text-pink-500 font-medium">Smart Meeting Room Reservation</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-pink-200 flex items-center gap-2"
        >
          <Plus size={20} />
          จองห้องประชุมใหม่
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: รายการจองวันนี้/เร็วๆ นี้ */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="text-pink-500" />
            ตารางการใช้ห้องประชุม
          </h2>
          
          <div className="space-y-4">
            {bookings.length > 0 ? bookings.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-pink-50 rounded-2xl flex flex-col items-center justify-center text-pink-600 border border-pink-100">
                    <span className="text-xs font-bold uppercase">{new Date(item.date).toLocaleDateString('th-TH', {month: 'short'})}</span>
                    <span className="text-xl font-black">{new Date(item.date).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {item.roomName}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {item.startTime} - {item.endTime} น.</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    item.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {item.status === 'approved' ? 'อนุมัติแล้ว' : 'รอตรวจสอบ'}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="bg-white/50 p-10 rounded-[2.5rem] border border-dashed border-slate-300 text-center text-slate-400">
                ยังไม่มีรายการจองในขณะนี้
              </div>
            )}
          </div>
        </div>

        {/* คอลัมน์ขวา: ข้อมูลห้องประชุม */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <Info className="text-pink-500" />
            สถานะห้องประชุม
          </h2>
          
          <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-xl border border-white space-y-4">
            {['ห้องประชุมใหญ่ (50 คน)', 'ห้อง Workshop (20 คน)', 'ห้องรับรอง VIP'].map((room, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                <span className="font-medium text-slate-700">{room}</span>
                <span className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              </div>
            ))}
            <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
              * ข้อมูลอัปเดตแบบ Real-time <br/> ตามฐานข้อมูล Google Firestore
            </p>
          </div>
        </div>
      </div>

      {/* Modal สำหรับกรอกข้อมูลการจอง */}
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
