import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { UserCheck, ShieldCheck, XCircle } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function StudentAttendance() {
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject") || "";
  const section = searchParams.get("section") || "";

  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // ฟังก์ชันคำนวณระยะห่าง (Haversine Formula) เป็นเมตร
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // รัศมีโลกเป็นเมตร
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCheckIn = async () => {
    if (!studentId) return alert("กรุณากรอกรหัสนักศึกษาครับ");
    
    setStatus("verifying");
    
    // 1. ขอพิกัดนักศึกษา
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // 2. ดึงพิกัดที่อาจารย์ตั้งไว้
        const sessionId = `${subject}-${section}`.replace(/\s+/g, '-');
        const sessionRef = doc(db, "active_sessions", sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists() || sessionSnap.data().status !== "active") {
          throw new Error("ระบบเช็คชื่อของวิชานี้ยังไม่ถูกเปิด หรือถูกปิดไปแล้วครับ");
        }

        const teacherLoc = sessionSnap.data().location;
        const distance = calculateDistance(latitude, longitude, teacherLoc.lat, teacherLoc.lng);

        // 3. ตรวจสอบระยะทาง (เช่น ไม่เกิน 50 เมตร)
        if (distance > 50) {
          throw new Error(`คุณอยู่ห่างจากห้องเรียนเกินไป (${Math.round(distance)}ม.) กรุณาขยับเข้ามาในห้องเรียนครับ`);
        }

        // 4. บันทึกข้อมูลลง Firebase
        const attendanceId = `${subject}-${section}-${studentId}`.replace(/\s+/g, '-');
        await setDoc(doc(db, "attendance", attendanceId), {
          studentId,
          subject,
          section,
          timestamp: serverTimestamp(),
          location: { lat: latitude, lng: longitude },
          status: "present"
        });

        setStatus("success");
      } catch (err: any) {
        setErrorMessage(err.message);
        setStatus("error");
      }
    }, (error) => {
      console.error("Geolocation error:", error);
      setErrorMessage("กรุณาเปิด GPS และอนุญาตให้แอปเข้าถึงตำแหน่งก่อนเช็คชื่อครับ");
      setStatus("error");
    });
  };

  return (
    <div className="min-h-screen py-12 px-6 flex flex-col items-center justify-center bg-brand-soft relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-pink-200 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl border border-white"
      >
        <div className="flex flex-col items-center text-center">
          {/* สถานะไอคอน */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${
            status === 'success' ? 'bg-green-100 text-green-600' : 
            status === 'error' ? 'bg-red-100 text-red-600' : 'bg-pink-100 text-pink-600'
          }`}>
            {status === 'success' ? <ShieldCheck size={40} /> : 
             status === 'error' ? <XCircle size={40} /> : <UserCheck size={40} />}
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">เช็คชื่อเข้าเรียน</h1>
          <p className="text-slate-500 mb-8">วิชา: <span className="text-pink-600 font-semibold">{subject}</span> (Sec: {section})</p>

          {status !== 'success' ? (
            <div className="w-full space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="รหัสนักศึกษา 13 หลัก" 
                  className="w-full p-4 pl-12 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={status === 'verifying'}
                />
                <UserCheck className="absolute left-4 top-4 text-slate-400" size={20} />
              </div>

              <button
                onClick={handleCheckIn}
                disabled={status === 'verifying'}
                className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
              >
                {status === 'verifying' ? "กำลังตรวจสอบพิกัด..." : "ยืนยันการเช็คชื่อ"}
              </button>

              {status === 'error' && (
                <p className="text-red-500 text-sm mt-4 bg-red-50 p-3 rounded-xl border border-red-100">
                  ⚠️ {errorMessage}
                </p>
              )}
            </div>
          ) : (
            <motion.div initial={{ y: 10 }} animate={{ y: 0 }} className="text-center">
              <h2 className="text-green-600 font-bold text-xl mb-2">เช็คชื่อสำเร็จ!</h2>
              <p className="text-slate-500">ข้อมูลของคุณถูกบันทึกในระบบเรียบร้อยแล้วครับ</p>
            </motion.div>
          )}
        </div>
      </motion.div>
      <p className="mt-8 text-slate-400 text-xs">RBRU Smart Attendance System v.2026</p>
    </div>
  );
}
