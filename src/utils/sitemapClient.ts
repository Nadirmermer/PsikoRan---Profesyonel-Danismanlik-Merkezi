import { supabase } from '../lib/supabase';

// Blog yazısı tipi
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image: string;
  published_at: string;
  category: string;
  is_published: boolean;
}

// Sabitleri tanımla
const SITE_DOMAIN = 'https://psikoran.com';
const CURRENT_DATE = '2025-03-24'; // Bugünün tarihi (belirlenen format)

/**
 * Tüm blog yazılarını getir
 */
export const fetchAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, cover_image, published_at, category, is_published')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Blog yazıları alınırken hata oluştu:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Blog yazıları alınırken bir hata oluştu:', err);
    return [];
  }
};

/**
 * Site haritasını oluştur
 */
export const generateSitemapXml = async (): Promise<string> => {
  try {
    // Tüm blog yazılarını getir
    const blogPosts = await fetchAllBlogPosts();
    
    // Statik sayfaların listesi - En önemli sayfalar başta
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/features', priority: '0.8', changefreq: 'monthly' },
      { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
      { url: '/demo', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/help', priority: '0.7', changefreq: 'monthly' },
      { url: '/login', priority: '0.6', changefreq: 'monthly' },
      { url: '/register', priority: '0.6', changefreq: 'monthly' },
      { url: '/create-assistant', priority: '0.5', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
      { url: '/terms', priority: '0.4', changefreq: 'yearly' },
      { url: '/kvkk', priority: '0.4', changefreq: 'yearly' },
      { url: '/forgot-password', priority: '0.3', changefreq: 'monthly' },
      { url: '/reset-password', priority: '0.3', changefreq: 'monthly' },
      { url: '/test-completed', priority: '0.3', changefreq: 'monthly' }
    ];
    
    // Sayfa resimleri için yardımcı fonksiyon
    const getPageImageData = (page: string) => {
      const imageMap: Record<string, {loc: string, title: string}> = {
        '/': {
          loc: `${SITE_DOMAIN}/assets/meta/og-image.jpg`,
          title: 'PsikoRan - Profesyonel Psikoloji Danışmanlık Merkezi'
        },
        '/blog': {
          loc: `${SITE_DOMAIN}/assets/meta/blog-banner.jpg`,
          title: 'PsikoRan Blog - Psikoloji Makaleleri ve Rehberler'
        },
        '/features': {
          loc: `${SITE_DOMAIN}/assets/meta/features-banner.jpg`,
          title: 'PsikoRan - Özellikler ve Hizmetler'
        },
        '/pricing': {
          loc: `${SITE_DOMAIN}/assets/meta/pricing-banner.jpg`,
          title: 'PsikoRan - Fiyatlandırma Planları'
        },
        '/demo': {
          loc: `${SITE_DOMAIN}/assets/meta/demo-banner.jpg`,
          title: 'PsikoRan - Ücretsiz Demo'
        },
        '/contact': {
          loc: `${SITE_DOMAIN}/assets/meta/contact-image.jpg`,
          title: 'İletişim - PsikoRan'
        },
        '/help': {
          loc: `${SITE_DOMAIN}/assets/meta/help-image.jpg`,
          title: 'Yardım ve Destek - PsikoRan'
        }
      };
      
      return imageMap[page];
    };
    
    // XML başlangıç
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" \n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Statik sayfalar için URL'ler
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_DOMAIN}${page.url}</loc>\n`;
      xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      
      // Ana sayfa, blog ve diğer özel sayfalar için resim ekle
      const imageData = getPageImageData(page.url);
      if (imageData) {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${imageData.loc}</image:loc>\n`;
        xml += `      <image:title>${imageData.title}</image:title>\n`;
        xml += '    </image:image>\n';
      }
      
      xml += '  </url>\n';
    }
    
    // Blog yazıları için URL'ler
    for (const post of blogPosts) {
      if (!post.is_published) continue;
      
      // Yayınlanma tarihini formatla
      const postDate = post.published_at 
        ? new Date(post.published_at).toISOString().split('T')[0]
        : CURRENT_DATE;
      
      xml += '  <url>\n';
      xml += `    <loc>${SITE_DOMAIN}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${postDate}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      
      // Blog yazısı için resim varsa ekle
      if (post.cover_image) {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${post.cover_image}</image:loc>\n`;
        xml += `      <image:title>${post.title}</image:title>\n`;
        xml += '    </image:image>\n';
      }
      
      xml += '  </url>\n';
    }
    
    // XML sonu
    xml += '</urlset>';
    
    return xml;
  } catch (error) {
    console.error('Site haritası oluşturulurken hata:', error);
    return '';
  }
};

/**
 * Netlify fonksiyon API'sını çağırarak site haritasını güncelle
 */
export const updateSitemap = async (): Promise<boolean> => {
  try {
    const sitemapXml = await generateSitemapXml();
    
    if (!sitemapXml) {
      console.error('Site haritası oluşturulamadı');
      return false;
    }
    
    // Site haritasını güncellemek için API'yi çağır
    const response = await fetch('/.netlify/functions/update-sitemap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sitemapXml }),
    });
    
    if (!response.ok) {
      throw new Error(`API yanıtı başarısız: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Site haritası güncelleme sonucu:', result);
    
    return result.success;
  } catch (error) {
    console.error('Site haritası güncellenirken hata:', error);
    return false;
  }
}; 