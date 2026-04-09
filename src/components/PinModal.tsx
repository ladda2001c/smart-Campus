import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LockKeyhole, X } from "lucide-react";

export default function PinModal({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean, onClose: () => void, onSuccess: () => void 
}) {
  const [pin, setPin] = useState("");
  const DEFAULT_PIN = "123456";

  const handleInput = (val: string) => {
    if (pin.length < 6) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin === DEFAULT_PIN) {
        setTimeout(() => { onSuccess(); setPin(""); }, 300);
      } else if (newPin.length === 6) {
        alert("รหัส PIN ไม่ถูกต้องครับ");
        setPin("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-100/40 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md p-8 rounded-[3rem] shadow-2xl relative border border-white"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-6">
              <LockKeyhole size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">ยืนยันรหัสเข้าใช้งาน</h2>
            <p className="text-slate-500 mb-8 text-center">เฉพาะอาจารย์เท่านั้น โปรดระบุ PIN 6 หลัก</p>

            {/* ช่องแสดงจุด PIN */}
            <div className="flex gap-4 mb-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-pink-500 border-pink-500 scale-125' : 'border-slate-200'}`} />
              ))}
            </div>

            {/* ปุ่มตัวเลข */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0].map((num) => (
                <button
                  key={num}
                  onClick={() => num === "C" ? setPin("") : handleInput(num.toString())}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold bg-slate-50 text-slate-700 hover:bg-pink-500 hover:text-white transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
