import { motion } from "motion/react";
import { GraduationCap, UsersRound } from "lucide-react";

interface RoleSelectionProps {
  onSelect: (role: 'teacher' | 'student') => void;
}

export default function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
      {/* ปุ่มสำหรับอาจารย์ */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('teacher')}
        className="bg-white/60 backdrop-blur-xl border border-white/80 p-10 rounded-[2.5rem] shadow-xl shadow-pink-100 flex flex-col items-center group transition-all"
      >
        <div className="w-20 h-20 bg-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-pink-200 group-hover:rotate-6 transition-transform">
          < GraduationCap className="text-white w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">สำหรับอาจารย์</h3>
        <p className="text-slate-500 mt-2">จัดการห้องประชุมและเช็คชื่อ</p>
      </motion.button>

      {/* ปุ่มสำหรับนักศึกษา */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('student')}
        className="bg-white/60 backdrop-blur-xl border border-white/80 p-10 rounded-[2.5rem] shadow-xl shadow-pink-100 flex flex-col items-center group transition-all"
      >
        <div className="w-20 h-20 bg-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:-rotate-6 transition-transform">
          <UsersRound className="text-white w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">สำหรับนักศึกษา</h3>
        <p className="text-slate-500 mt-2">สแกนเช็คชื่อเข้าเรียนผ่าน GPS</p>
      </motion.button>
    </div>
  );
}
