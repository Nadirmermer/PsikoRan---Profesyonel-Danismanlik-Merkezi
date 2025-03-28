import os
from PIL import Image

# Kaynak resim
source_image_path = "src/assets/base-logo.webp"

# Hedef klasör
target_folder = "public/images/icons"

# Oluşturulacak boyutlar
icon_sizes = [
    (72, 72),     # icon-72x72.webp
    (96, 96),     # icon-96x96.webp
    (128, 128),   # icon-128x128.webp
    (144, 144),   # icon-144x144.webp
    (152, 152),   # icon-152x152.webp
    (167, 167),   # icon-167x167.webp
    (180, 180),   # icon-180x180.webp
    (192, 192),   # icon-192x192.webp
    (384, 384),   # icon-384x384.webp
    (512, 512),   # icon-512x512.webp
]

# Özel görseller için boyutlar
special_sizes = [
    ("badge-72x72.webp", (72, 72)),
    ("shortcut-appointments.webp", (192, 192)),
    ("shortcut-messages.webp", (192, 192)),
    ("apple-launch-750x1334.webp", (750, 1334)),
    ("apple-launch-1125x2436.webp", (1125, 2436)),
]

# Ekran görüntüleri için boyutlar
screenshot_sizes = [
    ("home-screen.webp", (1280, 720)),
    ("appointment-screen.webp", (1280, 720)),
    ("profile-screen.webp", (1280, 720)),
]

def resize_image(source_path, target_path, size):
    try:
        img = Image.open(source_path)
        
        # Boyutlandırma ve kaydetme
        resized_img = img.resize(size, Image.LANCZOS)
        resized_img.save(target_path, format="WEBP", quality=90)
        
        print(f"Created: {target_path} ({size[0]}x{size[1]})")
    except Exception as e:
        print(f"Error creating {target_path}: {e}")

def main():
    # Hedef klasörün varlığını kontrol et
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    
    # Standart ikonları oluştur
    for size in icon_sizes:
        width, height = size
        target_path = os.path.join(target_folder, f"icon-{width}x{height}.webp")
        resize_image(source_image_path, target_path, size)
    
    # Özel görselleri oluştur
    for filename, size in special_sizes:
        target_path = os.path.join(target_folder, filename)
        resize_image(source_image_path, target_path, size)
    
    # Screenshots klasörünü oluştur
    screenshots_folder = os.path.join("public/images/screenshots")
    if not os.path.exists(screenshots_folder):
        os.makedirs(screenshots_folder)
    
    # Ekran görüntülerini oluştur
    for filename, size in screenshot_sizes:
        target_path = os.path.join(screenshots_folder, filename)
        resize_image(source_image_path, target_path, size)
    
    print("All icons generated successfully!")

if __name__ == "__main__":
    main() 