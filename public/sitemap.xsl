<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Site Haritası</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            font-size: 14px;
            color: #333;
            background: #f9f9f9;
            margin: 0;
            padding: 20px;
          }
          h1 {
            color: #5f2eea;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .intro {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .intro p {
            margin: 5px 0;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            margin-top: 20px;
          }
          th {
            text-align: left;
            padding: 12px 10px;
            background: #f0f0f0;
            border-bottom: 1px solid #ddd;
            color: #444;
            font-weight: 600;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            vertical-align: middle;
          }
          tr:hover td {
            background-color: #f7f7f7;
          }
          a {
            color: #5f2eea;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #888;
            font-size: 12px;
          }
          .image-name {
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="intro">
            <h1>PsikoRan XML Site Haritası</h1>
            <p>Bu XML site haritası Google, Bing, Yandex ve diğer arama motorları için oluşturulmuştur.</p>
            <p>Son güncelleme: 03.04.2025</p>
          </div>
          <div id="content">
            <table cellpadding="5">
              <tr>
                <th>URL</th>
                <th>Son Güncelleme</th>
                <th>Değişim Sıklığı</th>
                <th>Öncelik</th>
              </tr>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                </tr>
              </xsl:for-each>
            </table>
          </div>
          <div class="footer">
            <p>© 2025 PsikoRan - Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 