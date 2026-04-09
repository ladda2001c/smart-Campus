// นำ URL ที่ได้จากขั้นตอน Deploy Web App ของ Google Apps Script มาวางที่นี่
const SCRIPT_ID = "12AaREwP9tMkyjZHOtE0QcjincnygY1lJlbxLZ_u170uH2OgTIWU0mEnb";
const GAS_URL = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

export const sendEmailNotification = async (to: string, subject: string, message: string) => {
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // จำเป็นสำหรับ GAS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        body: `
          <div style="font-family: sans-serif; padding: 20px; border-radius: 20px; background-color: #FDF2F8; border: 1px solid #FCE7F3;">
            <h2 style="color: #EC4899;">Smart Campus RBRU</h2>
            <p style="color: #475569; font-size: 16px;">${message}</p>
            <hr style="border: 0; border-top: 1px solid #FCE7F3; margin: 20px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">นี่คือการแจ้งเตือนอัตโนมัติจากระบบ กรุณาอย่าตอบกลับอีเมลนี้</p>
          </div>
        `
      }),
    });
    return true;
  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};
