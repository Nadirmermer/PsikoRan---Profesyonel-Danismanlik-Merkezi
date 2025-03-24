const fs = require('fs');
const path = require('path');

// Netlify environment'da dosya yolları
const SITEMAP_PATH = path.join(__dirname, '../../public/sitemap.xml');

/**
 * Site haritasını güncelleyen Netlify Fonksiyonu
 * Bu fonksiyon POST metoduyla gönderilen site haritası XML'ini
 * sitemap.xml dosyasına kaydeder.
 */
exports.handler = async (event, context) => {
  // CORS için header'lar ekle
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Preflight OPTIONS isteklerini yanıtla
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS enabled' })
    };
  }

  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: "Method Not Allowed",
        allowedMethods: ['POST']
      }) 
    };
  }

  try {
    // İstek gövdesini parse et
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: "Geçersiz JSON formatı",
          error: parseError.message
        })
      };
    }

    const { sitemapXml } = requestBody;
    
    if (!sitemapXml) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: "Site haritası XML içeriği gereklidir" 
        }) 
      };
    }

    // XML içeriğinin geçerli olup olmadığını kontrol et
    if (!sitemapXml.includes('<?xml version="1.0" encoding="UTF-8"?>') || 
        !sitemapXml.includes('<urlset')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Geçersiz XML formatı, site haritası XML yapısına uygun değil"
        })
      };
    }

    // Dosyanın var olduğunu kontrol et ve yoksa dizini oluştur
    const sitemapDir = path.dirname(SITEMAP_PATH);
    if (!fs.existsSync(sitemapDir)) {
      fs.mkdirSync(sitemapDir, { recursive: true });
    }

    // Sitemap.xml dosyasını yaz
    fs.writeFileSync(SITEMAP_PATH, sitemapXml, 'utf8');

    // Başarılı yanıt döndür
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Site haritası başarıyla güncellendi",
        timestamp: new Date().toISOString(),
        path: SITEMAP_PATH,
        size: Buffer.byteLength(sitemapXml, 'utf8')
      })
    };
  } catch (error) {
    console.error("Site haritası güncellenirken hata oluştu:", error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: "Site haritası güncellenirken bir hata oluştu",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 