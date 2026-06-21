# Fire-SA - نظام إدارة طفايات الحريق

تطبيق ويب (PWA) لإدارة وفحص طفايات الحريق، يعمل على الجوال بدون متجر تطبيقات.

## الإعداد

### 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. في **SQL Editor**، شغّل محتوى ملف `supabase/schema.sql`
3. انسخ **Project URL** و **Anon Key** من Settings > API

### 2. إعداد المتغيرات البيئية
```bash
cp .env.local.example .env.local
```
عدّل `.env.local` وأدخل بيانات Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. تشغيل المشروع
```bash
npm install
npm run dev
```

### 4. إنشاء أول مستخدم (أدمن)
1. سجّل مستخدماً عبر Supabase Dashboard > Authentication > Users > Add user
2. في SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin', full_name = 'اسمك'
WHERE id = 'your-user-uuid';
```

## الميزات
- تسجيل دخول آمن لكل فرد في الفريق
- إدارة المناطق وتعيين المفتشين
- قائمة الطفايات مع تفاصيل كاملة
- نموذج فحص من الجوال (5 بنود)
- لوحة تحكم بالإحصاءات
- تقارير وتصدير Excel
- دعم كامل للغة العربية RTL
- PWA - يُثبَّت على شاشة الجوال

## النشر على Vercel
```bash
npx vercel --prod
```
أضف متغيرات البيئة في Vercel Dashboard.
