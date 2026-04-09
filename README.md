# Smart Campus RBRU

ระบบจัดการการจองห้องประชุมและเช็คชื่อเข้าเรียนสำหรับมหาวิทยาลัยราชภัฏรำไพพรรณี (RBRU)

## 🚀 การเตรียมตัวก่อน Deploy ขึ้น Netlify

เพื่อให้ระบบทำงานได้อย่างสมบูรณ์เมื่อนำขึ้น GitHub และ Netlify กรุณาทำตามขั้นตอนดังนี้:

### 1. การตั้งค่าบน GitHub
- สร้าง Repository ใหม่บน GitHub
- Push โค้ดทั้งหมดขึ้นไป (ไฟล์ `firebase-applet-config.json` จะถูก ignore เพื่อความปลอดภัย)

### 2. การตั้งค่าบน Netlify
- เชื่อมต่อ Repository จาก GitHub เข้ากับ Netlify
- ตั้งค่า **Build Settings**:
  - **Build Command:** `npm run build`
  - **Publish directory:** `dist`
- ตั้งค่า **Environment Variables** (ในเมนู Site configuration > Environment variables):
  นำค่าจากไฟล์ `firebase-applet-config.json` มาใส่ในตัวแปรดังนี้:
  - `VITE_FIREBASE_API_KEY`: ค่าของ `apiKey`
  - `VITE_FIREBASE_AUTH_DOMAIN`: ค่าของ `authDomain`
  - `VITE_FIREBASE_PROJECT_ID`: ค่าของ `projectId`
  - `VITE_FIREBASE_STORAGE_BUCKET`: ค่าของ `storageBucket`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`: ค่าของ `messagingSenderId`
  - `VITE_FIREBASE_APP_ID`: ค่าของ `appId`
  - `VITE_FIREBASE_DATABASE_ID`: ค่าของ `firestoreDatabaseId`

### 3. การตั้งค่า Firebase Console
- ไปที่ [Firebase Console](https://console.firebase.google.com/)
- เลือกโปรเจกต์ของคุณ
- ไปที่ **Authentication > Settings > Authorized domains**
- เพิ่มโดเมนของ Netlify (เช่น `your-app-name.netlify.app`) เพื่อให้ระบบ Google Login ทำงานได้

## 🛠 การพัฒนาในเครื่อง (Local Development)
1. คัดลอกไฟล์ `.env.example` เป็น `.env`
2. ใส่ค่าต่างๆ ให้ครบถ้วน
3. รันคำสั่ง:
   ```bash
   npm install
   npm run dev
   ```

## 📝 ฟีเจอร์หลัก
- **ระบบจองห้องประชุม:** ตรวจสอบเวลาทับซ้อนอัตโนมัติ
- **ระบบแจ้งเตือน:** ส่งอีเมลผ่าน Google Apps Script
- **ระบบจัดการอาจารย์:** นำเข้าข้อมูลผ่านไฟล์ CSV
- **ระบบเช็คชื่อ:** สำหรับนักศึกษาและอาจารย์

---
พัฒนาด้วย ❤️ สำหรับ RBRU
