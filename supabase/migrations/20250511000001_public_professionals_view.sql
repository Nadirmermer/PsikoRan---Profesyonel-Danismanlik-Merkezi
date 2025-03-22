-- Profesyoneller tablosuna public erişim politikası ekleme
-- Bu migration, profesyoneller tablosuna giriş yapmamış kullanıcıların da
-- erişebilmesini sağlar. Böylece, /uzmanlar sayfasında tüm profesyoneller görüntülenebilir.

-- Eğer varsa var olan politikayı kaldır
DROP POLICY IF EXISTS "Public can view professionals" ON professionals;

-- Herkese görüntüleme izni ver
CREATE POLICY "Public can view professionals" ON professionals
  FOR SELECT TO public
  USING (true); 