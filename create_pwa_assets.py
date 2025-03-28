import os
from PIL import Image, ImageOps

# Kaynak resim
source_image_path = "src/assets/base-logo.webp"

# Masaüstü ekran görüntüsü oluşturmak için yeni boyutlar
wide_screenshot_size = (1920, 1080)

# Oluşturulacak maskable ikon boyutları
maskable_icon_sizes = [
    (192, 192),  # maskable-icon-192x192.webp
    (512, 512),  # maskable-icon-512x512.webp
]

def create_maskable_icons(source_path, output_dir, sizes):
    """Maskable ikonlar oluşturur (kenarında daha fazla dolgu ile)"""
    try:
        img = Image.open(source_path)
        
        # Hedef klasörün varlığını kontrol et
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        for size in sizes:
            width, height = size
            
            # Maskable ikon için %30 dolgu ekle
            safe_zone = 0.7  # İkonun görselin %70'ını kaplaması
            padding = (1 - safe_zone) / 2
            
            # Yeni bir kare şeklinde arka plan oluştur
            background = Image.new('RGBA', (width, height), (255, 255, 255, 0))
            
            # Orijinal görseli boyutlandır ve ortala
            icon_size = int(width * safe_zone)
            resized_icon = img.resize((icon_size, icon_size), Image.LANCZOS)
            
            # İkonu arka planın ortasına yerleştir
            offset = (int((width - icon_size) / 2), int((height - icon_size) / 2))
            background.paste(resized_icon, offset, resized_icon)
            
            # Maskable ikonu kaydet
            target_path = os.path.join(output_dir, f"maskable-icon-{width}x{height}.webp")
            background.save(target_path, format="WEBP", quality=90)
            
            print(f"Created maskable icon: {target_path}")
            
    except Exception as e:
        print(f"Error creating maskable icons: {e}")

def create_wide_screenshot(source_path, output_dir, size):
    """Masaüstü (wide) ekran görüntüsü oluşturur"""
    try:
        img = Image.open(source_path)
        
        # Hedef klasörün varlığını kontrol et
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # Ekran görüntüsünü oluştur (örnek bir dashboard tasarımı)
        width, height = size
        
        # Beyaz arka plan oluştur
        background = Image.new('RGB', (width, height), (248, 250, 252))  # Slate-50 rengi
        
        # Header bölümü oluştur
        header_height = 80
        header = Image.new('RGB', (width, header_height), (255, 255, 255))  # Beyaz
        
        # Sol sidebar oluştur
        sidebar_width = 250
        sidebar = Image.new('RGB', (sidebar_width, height - header_height), (255, 255, 255))  # Beyaz
        
        # Logo yerleştir (orijinal logoyu küçültüp sol üst köşeye yerleştir)
        logo_size = 50
        resized_logo = img.copy().resize((logo_size, logo_size), Image.LANCZOS)
        logo_offset = (20, (header_height - logo_size) // 2)
        
        # Ana içerik alanını oluştur
        content_color = (255, 255, 255)  # Beyaz
        content_width = width - sidebar_width
        content_height = height - header_height
        content = Image.new('RGB', (content_width, content_height), content_color)
        
        # İçerikleri birleştir
        background.paste(header, (0, 0))
        background.paste(sidebar, (0, header_height))
        background.paste(content, (sidebar_width, header_height))
        
        # Logoyu yerleştir
        if resized_logo.mode == 'RGBA':
            background.paste(resized_logo, logo_offset, resized_logo)
        else:
            background.paste(resized_logo, logo_offset)
        
        # Ana başlık ekle (bu kısım sadece görseli doldurmak için)
        for i in range(5):
            # Sidebar menü öğeleri (basit gri kutular)
            y_offset = header_height + 20 + (i * 50)
            menu_item = Image.new('RGB', (sidebar_width - 40, 40), (241, 245, 249))  # Slate-100
            background.paste(menu_item, (20, y_offset))
            
        # İçerik öğeleri ekle
        content_padding = 20
        card_width = (content_width - content_padding * 3) // 2
        card_height = 200
        
        # Üst kartlar
        for i in range(2):
            x_offset = sidebar_width + content_padding + (i * (card_width + content_padding))
            card = Image.new('RGB', (card_width, card_height), (241, 245, 249))  # Slate-100
            background.paste(card, (x_offset, header_height + content_padding))
        
        # Alt kartlar
        for i in range(2):
            x_offset = sidebar_width + content_padding + (i * (card_width + content_padding))
            card = Image.new('RGB', (card_width, height - header_height - content_padding * 2 - card_height - content_padding), (241, 245, 249))  # Slate-100
            background.paste(card, (x_offset, header_height + content_padding * 2 + card_height))
        
        # Ekran görüntüsünü kaydet
        target_path = os.path.join(output_dir, "wide-dashboard.webp")
        background.save(target_path, format="WEBP", quality=90)
        
        print(f"Created wide screenshot: {target_path}")
            
    except Exception as e:
        print(f"Error creating wide screenshot: {e}")

if __name__ == "__main__":
    # Maskable ikonları oluştur
    create_maskable_icons(source_image_path, "public/images/icons", maskable_icon_sizes)
    
    # Masaüstü ekran görüntüsü oluştur
    create_wide_screenshot(source_image_path, "public/images/screenshots", wide_screenshot_size)
    
    print("All PWA assets created successfully!") 