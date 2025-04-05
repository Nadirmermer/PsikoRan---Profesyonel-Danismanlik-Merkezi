# Admin Hesabı Oluşturma Rehberi

Bu rehber, uygulamaya yönetici (admin) yetkilerine sahip bir kullanıcı hesabı ekleme adımlarını açıklar.

**Ön Koşullar:**

1.  **Veritabanı Güncellemesi:** `admins` tablosunu ve ilgili güvenlik kurallarını içeren veritabanı güncellemesinin (migration) Supabase projenize uygulandığından emin olun. Genellikle bu işlem, terminalde projenizin kök dizininde `supabase db push` komutu çalıştırılarak yapılır. Eğer bu komut çalıştırılmadıysa, admin hesabı oluşturulamaz.
2.  **Supabase Erişimi:** Supabase projenizin yönetici paneline ([app.supabase.io](https://app.supabase.io)) erişiminiz olmalıdır.

**Adımlar:**

1.  **Kullanıcı Hesabı Oluşturma (Eğer Yoksa):**
    *   Supabase projenizin panosuna gidin.
    *   Sol menüden **Authentication** (Kimlik Doğrulama) bölümünü açın.
    *   **Users** (Kullanıcılar) sekmesine tıklayın.
    *   Eğer admin yapmak istediğiniz kullanıcının hesabı zaten yoksa, sağ üstteki **"Add user"** (Kullanıcı Ekle) butonuna tıklayın.
    *   Admin olarak kullanmak istediğiniz **e-posta adresini** ve **güvenli bir şifre** girin.
    *   Kullanıcıyı kaydedin. (E-posta onayı ayarlarınıza bağlı olarak gerekebilir.)

2.  **Kullanıcı ID'sini Kopyalama:**
    *   Yine **Authentication** -> **Users** sekmesinde, admin yapmak istediğiniz kullanıcının üzerine tıklayın.
    *   Açılan kullanıcı detayları bölümünde **"User ID"** (veya UUID) yazan yerdeki uzun karakter dizisini **kopyalayın**. Bu ID, kullanıcıyı `admins` tablosuna eklemek için gereklidir.

3.  **Kullanıcıyı `admins` Tablosuna Ekleme:**
    *   Supabase panosunda sol menüden **Table Editor** (Tablo Düzenleyici) bölümüne gidin.
    *   Sol taraftaki tablo listesinden `admins` tablosunu bulun ve seçin.
    *   Sağ üstteki yeşil renkli **"+ Insert row"** (Satır Ekle) butonuna tıklayın.
    *   Açılan formda **`user_id`** sütununun altındaki boş alana, **2. adımda kopyaladığınız Kullanıcı ID'sini yapıştırın**.
    *   Diğer alanlar (`id`, `created_at`) otomatik olarak dolacaktır. Başka zorunlu alan yoksa, doğrudan **"Save"** (Kaydet) butonuna tıklayın.

4.  **Giriş Yapma:**
    *   Tarayıcınızda uygulamanızın admin giriş adresini açın: `[Uygulama Adresiniz]/admin/login`
    *   1. adımda oluşturduğunuz (veya belirlediğiniz) admin kullanıcısının **e-posta** ve **şifresiyle** giriş yapın.

**Başarılı Giriş:** Eğer tüm adımlar doğru yapıldıysa ve kullanıcı `admins` tablosuna başarıyla eklendiyse, giriş yaptıktan sonra otomatik olarak `/admin/panel` adresine yönlendirilmeniz gerekir.

**Sorun Giderme:**

*   Eğer `/admin/login` sayfasında "Bu hesap admin yetkisine sahip değil." hatası alırsanız, 3. adımı tekrar kontrol edin ve doğru Kullanıcı ID'sini `admins` tablosuna eklediğinizden emin olun.
*   Eğer `admins` tablosu Table Editor'da görünmüyorsa, 1. ön koşuldaki veritabanı güncellemesini yapmamışsınız demektir. 