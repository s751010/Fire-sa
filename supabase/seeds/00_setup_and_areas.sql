-- ============================================================
-- Fire-SA Seed Data - Generated from Excel FE-FH sheet
-- Total: 358 equipment items, 20 areas
-- ============================================================

-- Clear existing data (safe for initial setup)
DELETE FROM inspections;
DELETE FROM fire_extinguishers;
DELETE FROM areas;

-- ============================================================
-- AREAS (20 consolidated zones)
-- ============================================================
INSERT INTO areas (id, name, location) VALUES
  ('5ad2e327-75ec-52fd-9b8c-545ed26b0ffd', 'Zone 1', 'مصنع التعبئة - BOTTILING PLANT'),
  ('2e200322-7807-54e2-ae89-3f913f3fedcb', 'Zone 2', 'مصنع التعبئة - BOTTILING PLANT'),
  ('e970b88c-8221-5bf5-9767-392bf482e6a9', 'Zone 3', 'مصنع التعبئة - BOTTILING PLANT'),
  ('54121007-0cd8-5838-b8f5-217bea05f686', 'Zone 4', 'مصنع التعبئة - BOTTILING PLANT'),
  ('f596495c-8511-5006-8bca-912d3854dc76', 'المواد الخام', 'مصنع التعبئة - BOTTILING PLANT'),
  ('5752b602-6412-5e9e-8f88-6c8f3bf3ad73', 'مبنى التعقيم', 'مصنع التعبئة - BOTTILING PLANT'),
  ('ad7bfa9b-ff31-5c7c-97f9-4173e510fdb4', 'غرفة الضواغط', 'مصنع التعبئة - BOTTILING PLANT'),
  ('e1a4fd9f-1dbe-5b8f-8c5f-3976b8143a26', 'خزان المنتج النهائي', 'مصنع التعبئة - BOTTILING PLANT'),
  ('320a0a61-40a9-5dea-a1f7-db47b1650a9f', 'محطة التنقية', 'مصنع التعبئة - BOTTILING PLANT'),
  ('4d776b8b-edb1-523e-9c97-d91ed349ca28', 'محطة WPST', 'مصنع التعبئة - BOTTILING PLANT'),
  ('294d5aa4-a3cd-58ef-8460-b9e5566bf477', 'مبنى الزيارات', 'مصنع التعبئة - BOTTILING PLANT'),
  ('85658a0a-cd81-55f3-a5d5-2347f489f5e2', 'مبنى إدارة NWC', 'مصنع التعبئة - BOTTILING PLANT'),
  ('3847750d-e317-56b7-a8b6-27c6979fdfb1', 'مستودع قطع الغيار', 'مصنع التعبئة - BOTTILING PLANT'),
  ('cca9e9a6-03ce-57af-932a-6a4687c64522', 'غرفة مضخات الحريق', 'مصنع التعبئة - BOTTILING PLANT'),
  ('9813fe45-cc7c-5974-b5fc-7c5037d15198', 'محطة الطاقة', 'مصنع التعبئة - BOTTILING PLANT'),
  ('bf2bebb6-97c4-5dce-a7e5-09b5026b809d', 'مبنى الإدارة', 'مصنع التعبئة - BOTTILING PLANT'),
  ('0f24f993-c509-52dd-bddb-a1406a006566', 'مصنع البريفورم', 'منطقة البريفورم'),
  ('50a4f4c1-4c04-5599-a152-6842720258b7', 'مصنع التوزيع', 'منطقة التوزيع'),
  ('82a5506a-bd7a-55eb-8824-e952fdbaf450', 'السطح', 'المجمع الصناعي'),
  ('ced3ffde-6446-5167-bb1d-556e96c93371', 'ورش الاسكراب', 'منطقة الورش');

-- ============================================================
-- FIRE EXTINGUISHERS & HOSES (358 items)
-- Run files 01 through 04 after this file
-- ============================================================
