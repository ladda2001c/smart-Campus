import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Search, UserCheck, UserX, ChevronLeft, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentRecord {
  id: string;
  studentId: string;
  timestamp: any;
  status: "present" | "absent";
  subject: string;
  section: string;
}

export default function TeacherReport() {
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: () => void;

    if (isMonitoring && subject && section) {
      const q = query(
        collection(db, "attendance"),
        where("subject", "==", subject),
        where("section", "==", section)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudentRecord[];
        setStudents(data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
      }, (error) => {
        console.error("Error monitoring attendance:", error);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isMonitoring, subject, section]);

  const startMonitoring = () => {
    if (!subject || !section) {
      alert("กรุณาระบุวิชาและกลุ่มเรียนก่อนครับ");
      return;
    }
    setIsMonitoring(true);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "present" ? "absent" : "present";
      await updateDoc(doc(db, "attendance", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    if (window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
      try {
        await deleteDoc(doc(db, "attendance", id));
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  const presentCount = students.filter(s => s.status === "present").length;

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 min-h-screen bg-brand-soft relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-pink-200 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      {/* Header & Back Button */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate("/")} 
          className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-pink-600 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">รายงานการเข้าเรียน</h1>
          <p className="text-pink-500 font-medium">Real-time Monitoring</p>
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-slate-400 ml-2 mb-2 block uppercase">รหัสวิชา</label>
            <input 
              type="text" 
              placeholder="เช่น CS101" 
              className="w-full p-4 bg-white/50 border border-pink-100 rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none transition-all"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setIsMonitoring(false);
              }}
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-bold text-slate-400 ml-2 mb-2 block uppercase">Section</label>
            <input 
              type="text" 
              placeholder="01" 
              className="w-full p-4 bg-white/50 border border-pink-100 rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none transition-all"
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setIsMonitoring(false);
              }}
            />
          </div>
          <button 
            onClick={startMonitoring}
            className="p-4 bg-pink-600 text-white rounded-2xl shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95"
          >
            <Search size={24} />
          </button>
        </div>

        <div className="bg-pink-600 p-6 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <p className="text-pink-100 text-sm font-medium">มาเรียนแล้วทั้งหมด</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black">{presentCount}</h2>
            <span className="text-pink-200 font-bold">คน</span>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="relative z-10">
        {!isMonitoring ? (
          <div className="bg-white/40 backdrop-blur-md p-20 rounded-[3rem] border border-white/50 text-center">
            <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">พร้อมตรวจสอบข้อมูล</h3>
            <p className="text-slate-500">กรุณาระบุวิชาและกลุ่มเรียนเพื่อเริ่มการติดตามผล</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-6 mb-2">
              <h3 className="font-bold text-slate-700">รายชื่อนักศึกษา ({students.length})</h3>
              <button className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors">
                <Download size={18} />
                Export CSV
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {students.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/60 backdrop-blur-md p-12 rounded-[2.5rem] border border-white text-center"
                >
                  <p className="text-slate-400 font-medium">ยังไม่มีข้อมูลการเช็คชื่อในกลุ่มเรียนนี้</p>
                </motion.div>
              ) : (
                students.map((student) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-white flex items-center justify-between group hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                        student.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {student.studentId.slice(-2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{student.studentId}</h4>
                        <p className="text-xs text-slate-400 font-medium">
                          {student.timestamp?.toDate().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(student.id, student.status)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                          student.status === 'present' 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {student.status === 'present' ? <UserCheck size={14} /> : <UserX size={14} />}
                        {student.status === 'present' ? 'มาเรียน' : 'ขาดเรียน'}
                      </button>
                      
                      <button 
                        onClick={() => deleteRecord(student.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
