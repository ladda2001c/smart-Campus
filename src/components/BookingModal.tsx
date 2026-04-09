import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthStore } from "../store/useAuthStore";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    roomName: "ห้องประชุมใหญ่ (50 คน)",
    date: "",
    startTime: "",
    endTime: "",
  });

  const checkConflict = async () => {
    const q = query(
      collection(db, "bookings"),
      where("roomName", "==", formData.roomName),
      where("date", "==", formData.date),
      where("status", "==", "approved") // ตรวจสอบเฉพาะรายการที่อนุมัติแล้ว
    );

    const snapshot = await getDocs(q);
    const isConflict = snapshot.docs.some(doc => {
      const data = doc.data();
      // สูตรตรวจสอบเวลาทับซ้อน: (StartA < EndB) AND (EndA > StartB)
      return (formData.startTime < data.endTime) && (formData.endTime > data.startTime);
    });

    return isConflict;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("กรุณาล็อกอินก่อนครับ");
    
    // ตรวจสอบเวลาไม่ให้ย้อนหลัง
    const selectedDateTime = new Date(`${formData.date}T${formData.startTime}`);
    if (selectedDateTime < new Date()) {
      return alert("ไม่สามารถจองเวลาย้อนหลังได้ครับ");
    }

    setLoading(true);
    
    try {
      const hasConflict = await checkConflict();
      if (hasConflict) {
        alert("ขออภัยครับ! ห้องนี้ถูกจองไปแล้วในช่วงเวลาดังกล่าว กรุณาเลือกเวลาอื่นครับ");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "bookings"), {
        ...formData,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        status: "pending", // รอ Admin อนุมัติ
        createdAt: serverTimestamp(),
      });

      alert("ส่งคำขอจองห้องประชุมเรียบร้อยแล้ว! กรุณารอการอนุมัติจาก Admin ครับ");
      onClose();
      // Reset form
      setFormData({
        title: "",
        roomName: "ห้องประชุมใหญ่ (50 คน)",
        date: "",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-100/40 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-xl p-8 rounded-[3rem] shadow-2xl relative border border-white overflow-y-auto max-h-[90vh]"
        >
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-pink-600 transition-colors">
            <X size={24} />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">จองห้องประชุม</h2>
            <p className="text-slate-500">ระบุรายละเอียดการใช้ห้องประชุมของคุณ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auto-filled User Info Section */}
            <div className="bg-pink-50/50 p-4 rounded-2xl flex items-center gap-4 border border-pink-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle2 className="text-pink-500" size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-pink-600 uppercase">ข้อมูลผู้จอง</p>
                <p className="text-sm text-slate-700">{user?.displayName} ({user?.email})</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block">หัวข้อการประชุม</label>
              <input 
                required
                type="text" 
                placeholder="ระบุหัวข้อหรือชื่อโครงการ"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block">เลือกห้องประชุม</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none appearance-none"
                  value={formData.roomName}
                  onChange={(e) => setFormData({...formData, roomName: e.target.value})}
                >
                  <option>ห้องประชุมใหญ่ (50 คน)</option>
                  <option>ห้อง Workshop (20 คน)</option>
                  <option>ห้องรับรอง VIP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block">วันที่ต้องการใช้งาน</label>
                <input 
                  required
                  type="date" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block">เวลาเริ่ม</label>
                <input 
                  required
                  type="time" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block">เวลาสิ้นสุด</label>
                <input 
                  required
                  type="time" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-pink-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? "กำลังส่งคำขอ..." : "ยืนยันการจองห้อง"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
