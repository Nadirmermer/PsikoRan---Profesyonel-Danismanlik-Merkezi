import { supabase } from './supabase';

// Blog yazısı tipi tanımı
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  published_at: string;
  category: string;
  tags: string[];
  slug: string;
  reading_time: number;
  is_published?: boolean;
}

// Minimal örnek blog yazıları (API ile veri gelmediği durumda kullanılacak)
export const sampleBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Psikolojik Danışmanlık Hakkında",
    excerpt: "Psikolojik danışmanlık sürecine başlarken beklentileriniz neler olmalı? Süreç nasıl ilerler?",
    content: `
      <h2>Psikolojik Danışmanlık Süreci</h2>
      <p>Psikolojik danışmanlık, bireylerin duygusal ve davranışsal sorunlarını çözmelerine yardımcı olan profesyonel bir süreçtir.</p>
      <p>Danışan ve terapist arasında güven ilişkisinin kurulması büyük önem taşır. <strong>Dr. Mehmet Yılmaz</strong> danışanlarıyla ilk görüşmede bu ilişkiyi kurmaya özen gösterir.</p>
      <p>Daha fazla bilgi için lütfen uzmanlarımızla iletişime geçin.</p>
    `,
    cover_image: "/assets/images/blog-placeholder.jpg",
    author: "Dr. Mehmet Yılmaz",
    published_at: "2023-05-15T10:00:00Z",
    category: "Psikoloji",
    tags: ["danışmanlık", "terapi"],
    slug: "psikolojik-danismanlik-hakkinda",
    reading_time: 3,
    is_published: true
  }
];

/**
 * Blog görsellerini WebP formatına dönüştüren ve optimize eden yardımcı fonksiyon
 * @param imageUrl Resim URL'si
 * @param width Resim genişliği (varsayılan: 800)
 * @param height Resim yüksekliği (opsiyonel)
 * @param quality Resim kalitesi (varsayılan: 80)
 * @returns Optimize edilmiş resim URL'si
 */
export function transformImageUrl(imageUrl: string, width: number = 800, height?: number, quality: number = 80): string {
  if (!imageUrl) return imageUrl;
  
  // Supabase storage URL'si mi kontrol et
  if (imageUrl.includes('supabase.co/storage/v1/object/public')) {
    // URL parametrelerini oluştur
    const params = new URLSearchParams();
    params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', 'webp'); // WebP formatını açıkça belirt
    
    // WebP formatında ve optimize edilmiş URL döndür
    return `${imageUrl}?${params.toString()}`;
  }
  
  return imageUrl;
}

/**
 * Blog yazılarını getirir
 * @param limit Kaç adet blog yazısı getirileceği (opsiyonel, varsayılan tüm yazılar)
 * @returns Blog yazıları listesi
 */
export async function fetchBlogPosts(limit?: number): Promise<BlogPost[]> {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Resimleri optimize et
      return data.map(post => ({
        ...post,
        cover_image: transformImageUrl(post.cover_image)
      })) as BlogPost[];
    } else {
      // Veri yoksa örnek verileri döndür
      return limit ? sampleBlogPosts.slice(0, limit) : sampleBlogPosts;
    }
  } catch (err) {
    console.error('Blog yazıları getirilirken hata oluştu:', err);
    // Hata durumunda örnek verileri döndür
    return limit ? sampleBlogPosts.slice(0, limit) : sampleBlogPosts;
  }
}

/**
 * Belirli bir kategorideki blog yazılarını getirir
 * @param category Kategori adı
 * @param limit Kaç adet blog yazısı getirileceği (opsiyonel, varsayılan tüm yazılar)
 * @returns Belirli kategorideki blog yazıları
 */
export async function fetchBlogPostsByCategory(category: string, limit?: number): Promise<BlogPost[]> {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .eq('category', category)
      .order('published_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Resimleri optimize et
      return data.map(post => ({
        ...post,
        cover_image: transformImageUrl(post.cover_image)
      })) as BlogPost[];
    } else {
      // Veri yoksa ilgili kategorideki örnek verileri döndür
      const filteredPosts = sampleBlogPosts.filter(post => post.category === category);
      return limit ? filteredPosts.slice(0, limit) : filteredPosts;
    }
  } catch (err) {
    console.error(`${category} kategorisindeki blog yazıları getirilirken hata oluştu:`, err);
    // Hata durumunda ilgili kategorideki örnek verileri döndür
    const filteredPosts = sampleBlogPosts.filter(post => post.category === category);
    return limit ? filteredPosts.slice(0, limit) : filteredPosts;
  }
}

/**
 * Belirli bir slug'a sahip blog yazısını getirir
 * @param slug Yazının slug değeri
 * @returns Blog yazısı veya null
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Resmi optimize et
      const post = data[0] as BlogPost;
      return {
        ...post,
        cover_image: transformImageUrl(post.cover_image, 1200) // Daha büyük resim
      };
    } else {
      // Veri yoksa slug'a uygun örnek veriyi döndür
      const samplePost = sampleBlogPosts.find(post => post.slug === slug);
      return samplePost || null;
    }
  } catch (err) {
    console.error(`Slug değeri ${slug} olan blog yazısı getirilirken hata oluştu:`, err);
    // Hata durumunda slug'a uygun örnek veriyi döndür
    const samplePost = sampleBlogPosts.find(post => post.slug === slug);
    return samplePost || null;
  }
}

/**
 * Tarih formatını insan tarafından okunabilir hale getirir
 * @param dateString Tarih string'i
 * @returns Formatlanmış tarih
 */
export function formatBlogDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// İsmi URL-dostu formata dönüştür
export const slugifyName = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[üÜ]/g, 'u')
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[öÖ]/g, 'o')
    .replace(/[^a-z0-9-]/g, '');
};

// Uzman isimlerini işle - artık link yapmıyoruz
export const processProfessionalNames = (content: string): string => {
  // Bu fonksiyonu artık kullanmıyoruz, içeriği olduğu gibi döndürüyoruz
  return content;
};

/**
 * Blog yazısı için JSON-LD yapılandırılmış veri oluşturur (SEO için)
 * @param post Blog yazısı
 * @param baseUrl Temel URL
 * @returns JSON-LD içeriği
 */
export function generateBlogJsonLd(post: BlogPost, baseUrl: string = 'https://psikoran.com'): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.cover_image || `${baseUrl}/assets/images/blog-placeholder.jpg`,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "PsikoRan",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/assets/meta/logo.png`
      }
    },
    "url": `${baseUrl}/blog/${post.slug}`,
    "datePublished": post.published_at,
    "dateModified": post.published_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "keywords": post.tags.join(", "),
    "articleSection": post.category,
    "wordCount": post.content.split(/\s+/).length
  };

  return JSON.stringify(jsonLd);
}

/**
 * Blog listesi için JSON-LD yapılandırılmış veri oluşturur (SEO için)
 * @param posts Blog yazıları
 * @param baseUrl Temel URL
 * @returns JSON-LD içeriği
 */
export function generateBlogListJsonLd(posts: BlogPost[], baseUrl: string = 'https://psikoran.com'): string {
  const listItems = posts.map((post, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": `${baseUrl}/blog/${post.slug}`,
    "name": post.title,
    "image": post.cover_image || `${baseUrl}/assets/images/blog-placeholder.jpg`,
    "description": post.excerpt
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": listItems,
    "numberOfItems": posts.length,
    "url": `${baseUrl}/blog`
  };

  return JSON.stringify(jsonLd);
} 