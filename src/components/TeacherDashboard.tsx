import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Users, Play, StopCircle, FileText } from "lucide-react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [isStarted, setIsStarted] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const navigate = useNavigate();

  // ฟังก์ชันดึงพิกัดดาวเทียม (GPS)
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }, (error) => {
        console.error("Geolocation error:", error);
        alert("กรุณาอนุญาตให้แอปเข้าถึงตำแหน่ง (GPS) เพื่อเริ่มการเช็คชื่อครับ");
      });
    } else {
      alert("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง GPS");
    }
  };

  const handleStartAttendance = async () => {
    if (!subject || !section || !coords) {
      alert("กรุณากรอกข้อมูลวิชา/กลุ่มเรียน และดึงพิกัด GPS ก่อนครับ");
      return;
    }

    const sessionId = `${subject}-${section}`.replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, "active_sessions", sessionId), {
        subject,
        section,
        location: coords,
        status: "active",
        createdAt: serverTimestamp(),
      });
      setIsStarted(true);
    } catch (err) {
      console.error("Error starting session:", err);
      alert("เกิดข้อผิดพลาดในการเริ่มระบบเช็คชื่อ");
    }
  };

  const handleStopAttendance = async () => {
    const sessionId = `${subject}-${section}`.replace(/\s+/g, '-');
    try {
      await setDoc(doc(db, "active_sessions", sessionId), {
        status: "inactive",
      }, { merge: true });
      setIsStarted(false);
    } catch (err) {
      console.error("Error stopping session:", err);
    }
  };

  return (
    <div className="py-10 max-w-2xl mx-auto px-4">
      {/* ส่วนหัวแสดงโปรไฟล์ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            T
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">แผงควบคุมอาจารย์</h1>
            <p className="text-sm text-slate-500">จัดการการเรียนการสอนและเช็คชื่อ</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/report")}
          className="flex items-center gap-2 px-4 py-2 bg-white text-pink-600 font-bold rounded-xl shadow-sm hover:bg-pink-50 transition-all"
        >
          <FileText size={18} />
          <span className="hidden sm:inline">ดูรายงาน</span>
        </button>
      </motion.div>

      {/* บัตรเลือกวิชาและพิกัด */}
      <div className="space-y-6">
        <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white">
          <div className="flex items-center gap-2 mb-6 text-pink-600 font-semibold">
            <Users size={20} />
            <span>ข้อมูลรายวิชา</span>
          </div>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="รหัสวิชา หรือ ชื่อวิชา" 
              className="w-full p-4 bg-white/50 border border-pink-100 rounded-2xl focus:ring-2 focus:ring-pink-400 outline-none transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isStarted}
            />
            <input 
              type="text" 
              placeholder="Section (เช่น 01)" 
              className="w-full p-4 bg-white/50 border border-pink-100 rounded-2xl focus:ring-2 focus:ring-pink-400 outline-none transition-all"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={isStarted}
            />
          </div>

          <div className="mt-6 p-4 bg-pink-50 rounded-2xl border border-pink-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className={coords ? "text-green-500" : "text-pink-400"} />
              <span className="text-sm text-slate-600">
                {coords ? `พิกัด: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "ยังไม่ได้ระบุตำแหน่ง"}
              </span>
            </div>
            <button 
              onClick={getLocation}
              disabled={isStarted}
              className="px-4 py-2 bg-white text-pink-600 text-xs font-bold rounded-xl shadow-sm hover:bg-pink-100 transition-colors disabled:opacity-50"
            >
              ดึงพิกัดปัจจุบัน
            </button>
          </div>
        </section>

        {/* ปุ่มสร้าง QR Code */}
        {!isStarted ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStartAttendance}
            className="w-full py-6 bg-pink-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-pink-200 flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" />
            เริ่มเช็คชื่อและสร้าง QR CODE
          </motion.button>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-pink-500 text-center"
          >
            <div className="flex justify-center mb-6">
              {/* สร้าง QR Code จาก API ง่ายๆ */}
              <div className="p-4 bg-white rounded-3xl border-4 border-pink-50 shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/student?subject=${subject}&section=${section}`)}`} 
                  alt="QR Code"
                  className="w-48 h-48"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">เปิดระบบเช็คชื่อแล้ว</h3>
            <p className="text-slate-500 text-sm mb-6 italic">วิชา: {subject} | Section: {section}</p>
            
            <button 
              onClick={handleStopAttendance}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <StopCircle size={20} />
              ปิดการรับข้อมูล
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
