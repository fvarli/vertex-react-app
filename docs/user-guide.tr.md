# Vertex Coach Web Kullanım Kılavuzu (TR)

## Bu paneli kim kullanır?
- Owner Admin: çalışma alanının tamamını yönetir (öğrenciler, programlar, randevular, takvim).
- Trainer: yalnızca aktif çalışma alanındaki kendi kapsamındaki kayıtları yönetir.

## Giriş ve çalışma alanı akışı
1. `/login` ekranından giriş yap.
2. `Çalışma Alanları` sayfasından aktif alanı seç.
3. Domain sayfalarına geç: Öğrenciler, Programlar, Randevular, Takvim.

Aktif çalışma alanı seçilmezse, korumalı domain sayfaları otomatik olarak `*/workspaces` ekranına yönlendirir.

## Owner Admin hızlı akış
1. Önce `Panel` ekranında KPI kartları ve bugünün zaman çizelgesini kontrol et.
2. `Öğrenciler` ekranında öğrenci kayıtlarını oluştur/güncelle.
3. Öğrenci bazlı haftalık `Programlar` planla ve takip et.
4. Çakışma kontrollü doğrulama ile `Randevular` oluştur/güncelle.
5. Gün/hafta görünümünü `Takvim` üzerinden takip et.
6. `Randevular` ekranında randevu bazlı WhatsApp aksiyonlarını kullan (`WhatsApp Aç` + gönderildi/gönderilmedi durumu).

## Trainer hızlı akış
1. Aktif çalışma alanını seç.
2. Günlük plan için `Panel` KPI ve zaman çizelgesine bak.
3. Sadece kendine bağlı öğrencileri ve durumlarını yönet.
4. Haftalık öğrenci programlarını oluştur.
5. Randevu planlamasını yap ve takvimden takip et.

## Durumlar ve kısıtlar
- Öğrenci durumu: `active` veya `passive`.
- Program durumu: `draft`, `active`, `archived`.
- Randevu durumu: `planned`, `done`, `cancelled`, `no_show`.
- Backend, antrenör/öğrenci saat çakışmalarını engeller.
- Randevu oluştururken tekrarlı kayıtları engellemek için `Idempotency-Key` header kullanılabilir.

## Sorun giderme
- `401 Invalid credentials`: e-posta ve şifreyi birebir kontrol et.
- `401 Unauthenticated` (refresh-token): token/oturum eksik veya süresi dolmuş olabilir.
- `403` domain sayfalarında: aktif çalışma alanı seçilmemiş veya rol/yetki erişimi yok.
- API sözleşmesi kaynak repo: kardeş backend projesi `vertex-laravel-api`.
