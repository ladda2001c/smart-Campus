import React, { useState } from "react";
import { db } from "../firebase";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import Papa from "papaparse";
import { FileUp, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function StaffUpload() {
  const [uploading, setUploading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        const batch = writeBatch(db);
        
        try {
          // กฎการเขียนข้อมูล: ไม่เกิน 490 รายการต่อรอบ (Batch Limit)
          let count = 0;
          data.slice(0, 490).forEach((staff: any) => {
            if (staff.email && staff.email.includes("@rbru.ac.th")) {
              const staffRef = doc(db, "teachers", staff.email.trim());
              batch.set(staffRef, {
                name: staff.name || "",
                phone: staff.phone || "",
                email: staff.email.trim(),
                department: staff.department || "",
                role: "teacher",
                updatedAt: serverTimestamp()
              }, { merge: true });
              count++;
            }
          });

          if (count === 0) {
            throw new Error("ไม่พบข้อมูลอีเมลที่ถูกต้องในไฟล์ CSV (ต้องลงท้ายด้วย @rbru.ac.th)");
          }

          await batch.commit();
          setUploading(false);
          setComplete(true);
          setTimeout(() => setComplete(false), 3000);
        } catch (err: any) {
          console.error("Error uploading staff:", err);
          setError(err.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
          setUploading(false);
        }
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        setError("ไม่สามารถอ่านไฟล์ CSV ได้");
        setUploading(false);
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-white text-center shadow-xl"
    >
      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all ${
        complete ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-600'
      }`}>
        {uploading ? <Loader2 className="animate-spin" size={40} /> : 
         complete ? <CheckCircle size={40} /> : <FileUp size={40} />}
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">อัปเดตรายชื่ออาจารย์</h2>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        เลือกไฟล์ CSV ที่มีคอลัมน์ <code className="bg-slate-100 px-1 rounded text-pink-600">name</code>, 
        <code className="bg-slate-100 px-1 rounded text-pink-600 ml-1">email</code>, 
        <code className="bg-slate-100 px-1 rounded text-pink-600 ml-1">phone</code>, 
        <code className="bg-slate-100 px-1 rounded text-pink-600 ml-1">department</code> 
        เพื่ออัปเดตข้อมูลเข้าระบบ
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <label className={`inline-flex items-center gap-3 px-10 py-4 bg-pink-600 text-white rounded-full font-bold cursor-pointer hover:bg-pink-700 shadow-lg shadow-pink-200 transition-all active:scale-95 ${
        uploading ? 'opacity-50 pointer-events-none' : ''
      }`}>
        {uploading ? "กำลังประมวลผล..." : "เลือกไฟล์ CSV"}
        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
      </label>

      {complete && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-4 text-green-600 font-bold"
        >
          นำเข้าข้อมูลสำเร็จแล้ว!
        </motion.p>
      )}
    </motion.div>
  );
}
