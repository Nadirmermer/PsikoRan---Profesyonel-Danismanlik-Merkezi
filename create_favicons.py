import os
from PIL import Image

# Kaynak resim
source_image_path = "src/assets/base-logo.webp"

# Hedef klasör
target_folder = "public/assets/favicons"

# Oluşturulacak favicon boyutları
favicon_sizes = [
    (16, 16),  # favicon-16x16.webp
    (32, 32),  # favicon-32x32.webp
    (48, 48),  # favicon-48x48.webp
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
    
    # Favicon'ları oluştur
    for size in favicon_sizes:
        width, height = size
        target_path = os.path.join(target_folder, f"favicon-{width}x{height}.webp")
        resize_image(source_image_path, target_path, size)
    
    # 32x32 favicon'ı ayrıca oluştur
    resize_image(source_image_path, os.path.join(target_folder, "favicon-32x32.webp"), (32, 32))
    
    # 48x48 favicon'ı ayrıca oluştur
    resize_image(source_image_path, os.path.join(target_folder, "favicon-48x48.webp"), (48, 48))
    
    print("All favicons generated successfully!")

if __name__ == "__main__":
    main() 