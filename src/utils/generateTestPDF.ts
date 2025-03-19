import jsPDF from 'jspdf';
import { Test } from '../data/tests/types';
import { setupFonts } from './fonts';
import { getLogoUrl } from './logoUtils';

// Temel arayüzler
interface Client {
  id: string;
  full_name: string;
  professional?: {
    full_name: string;
    title?: string;
    clinic_name?: string;
  };
}

interface Professional {
  id: string;
  full_name: string;
  title?: string;
}

interface TestResult {
  id: string;
  test_type: string;
  score: number;
  answers: Record<string, any>;
  created_at: string;
  duration_seconds?: number;
}

// Tema sabitleri
const THEME = {
  colors: {
    primary: { r: 42, g: 72, b: 108 },      // Koyu mavi - kurumsal ana renk
    secondary: { r: 80, g: 140, b: 200 },   // Açık mavi - vurgu rengi
    accent: { r: 230, g: 126, b: 34 },      // Turuncu - vurgu rengi
    text: { r: 51, g: 51, b: 51 },          // Koyu gri - ana metin
    textLight: { r: 120, g: 120, b: 120 },  // Açık gri - ikincil metin
    white: { r: 255, g: 255, b: 255 },      // Beyaz
    lightGray: { r: 245, g: 245, b: 245 }   // Açık gri arka plan
  },
  fonts: {
    heading: {
      family: "helvetica",
      style: "bold",
      sizes: { h1: 22, h2: 16, h3: 14 }
    },
    body: {
      family: "helvetica",
      style: "normal",
      sizes: { normal: 11, small: 9, large: 12 }
    }
  },
  spacing: {
    margin: {
      top: 50, right: 50, bottom: 50, left: 50
    },
    lineHeight: {
      small: 14,
      normal: 18,
      large: 22
    }
  },
  borderRadius: 3
};

// Yardımcı fonksiyonlar
function turkishToAscii(text: string): string {
    const replacements: { [key: string]: string } = {
      'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I',
      'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
      'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    };
  return (text || '').replace(/[şŞıİğĞüÜöÖçÇ]/g, match => replacements[match] || match);
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '-';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

class TestPDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private marginLeft: number;
  private marginRight: number;
  private contentWidth: number;

  constructor(
    private test: Test,
    private result: TestResult,
    private client: Client,
    private professional: Professional
  ) {
  // PDF oluştur
    this.pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

    // Font ayarlarını yap
    setupFonts(this.pdf);

    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.marginLeft = THEME.spacing.margin.left;
    this.marginRight = THEME.spacing.margin.right;
    this.contentWidth = this.pageWidth - (this.marginLeft + this.marginRight);

    this.setFont();
  }

  generate(): jsPDF {
    this.drawHeader();
    this.drawTestInfo();
    this.drawResults();
    this.drawFooter();
    return this.pdf;
  }

  private setFont(type: 'heading' | 'body' = 'body', size: 'normal' | 'small' | 'large' | 'h1' | 'h2' | 'h3' = 'normal'): void {
    const font = THEME.fonts[type];
    const fontSize = font.sizes[size as keyof typeof font.sizes];
    this.pdf.setFont(font.family, font.style);
    this.pdf.setFontSize(fontSize);
  }

  private setColor(color: keyof typeof THEME.colors): void {
    const { r, g, b } = THEME.colors[color];
    this.pdf.setTextColor(r, g, b);
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, color: keyof typeof THEME.colors, radius = THEME.borderRadius): void {
    const { r, g, b } = THEME.colors[color];
    this.pdf.setFillColor(r, g, b);
    this.pdf.roundedRect(x, y, width, height, radius, radius, 'F');
  }

  private drawLogo(x: number, y: number, width: number, height: number): void {
    try {
      // Logo resmini doğrudan ekle
      const logoUrl = getLogoUrl();
      this.pdf.addImage(logoUrl, 'PNG', x, y, width, height);
    } catch (error) {
      console.error('Logo eklenirken hata oluştu:', error);
      
      // Hata durumunda yedek olarak metin logo göster
      this.pdf.setFillColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
      this.pdf.roundedRect(x, y, width, height, 3, 3, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(36);
      this.pdf.text("P", x + width / 2, y + height / 2 + 12, { align: 'center' });
    }
    
    // Logo altına "PsikoRan" yazısı
    this.setColor('primary');
    this.setFont('heading', 'h2');
    this.pdf.text("PsikoRan", x + width / 2, y + height + 20, { align: 'center' });
  }

  private drawHeader(): void {
    const headerHeight = 120; // Yüksekliği artırdım
    
    // Ana header container - beyaz arka plan
    this.drawRoundedRect(0, 0, this.pageWidth, headerHeight, 'white');
    
    // Üst kısımda ince bir çizgi
    this.pdf.setFillColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.rect(0, 0, this.pageWidth, 5, 'F');
    
    // Logo çiz - boyutu artırıldı
    this.drawLogo(this.marginLeft, 15, 70, 70);
    
    // Danışan adı - X pozisyonu logo boyutuna göre ayarlandı
    const clientNameX = this.marginLeft + 90;
    this.setColor('primary');
    this.setFont('heading', 'h1');
    const clientName = turkishToAscii(this.client.full_name);
    this.pdf.text(clientName, clientNameX, 40);
    
    // İnce ayırıcı çizgi
    this.pdf.setDrawColor(THEME.colors.lightGray.r, THEME.colors.lightGray.g, THEME.colors.lightGray.b);
    this.pdf.setLineWidth(1);
    this.pdf.line(clientNameX, 45, this.pageWidth - this.marginRight, 45);

    // Test adı
    this.setColor('text');
    this.setFont('body', 'large');
    const testInfo = turkishToAscii(`${this.test.name}`);
    this.pdf.text(testInfo, clientNameX, 65);
    
    // Uzman bilgisi - Y pozisyonunu artırdım
    this.setColor('textLight');
    this.setFont('body', 'normal');
    const professionalInfo = turkishToAscii(`Uzman: ${this.professional.full_name}${this.professional.title ? `, ${this.professional.title}` : ''}`);
    this.pdf.text(professionalInfo, clientNameX, 85);
    
    // Tarih ve kurum bilgileri
    const date = new Date(this.result.created_at);
    const dateTimeStr = turkishToAscii(date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    // Sağ tarafta bilgi kutusu - Y pozisyonunu değiştirdim
    const infoBoxWidth = 200;
    const infoBoxX = this.pageWidth - this.marginRight - infoBoxWidth;
    const infoBoxY = 50; // Kutuyu biraz aşağı aldım
    
    this.drawRoundedRect(infoBoxX, infoBoxY, infoBoxWidth, 50, 'lightGray'); // Yüksekliği artırdım
    
    this.setColor('text');
    this.setFont('body', 'small');
    
    // Tarih ve süre bilgileri - Y pozisyonlarını ayarladım
    const tarihText = turkishToAscii(`Tarih: ${dateTimeStr}`);
    const sureText = turkishToAscii(`Süre: ${formatDuration(this.result.duration_seconds)}`);
    const kurumText = turkishToAscii(`Kurum: ${this.client.professional?.clinic_name || '-'}`);
    
    this.pdf.text(tarihText, infoBoxX + 10, infoBoxY + 15);
    this.pdf.text(sureText, infoBoxX + 10, infoBoxY + 30);
    this.pdf.text(kurumText, infoBoxX + 10, infoBoxY + 45);
    
    // Alt kısımda ince bir çizgi
    this.pdf.setDrawColor(THEME.colors.lightGray.r, THEME.colors.lightGray.g, THEME.colors.lightGray.b);
    this.pdf.setLineWidth(1);
    this.pdf.line(this.marginLeft, headerHeight - 1, this.pageWidth - this.marginRight, headerHeight - 1);
  }

  private drawTestInfo(): void {
    const startY = 150; // Başlangıç Y pozisyonunu artırdım
    
    // Başlık
    this.setColor('primary');
    this.setFont('heading', 'h2');
    this.pdf.text(turkishToAscii("Test Bilgileri"), this.marginLeft, startY);
    
    // Alt çizgi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, startY + 5, this.marginLeft + 100, startY + 5);
    
    // Test açıklaması
    this.setColor('text');
    this.setFont('body', 'normal');
    const testDescription = turkishToAscii(this.test.description || "Bu test için açıklama bulunmamaktadır.");
    
    // Çok satırlı metin için
    const splitText = this.pdf.splitTextToSize(testDescription, this.contentWidth);
    this.pdf.text(splitText, this.marginLeft, startY + 25);
  }

  private drawResults(): void {
    const startY = 230; // Başlangıç Y pozisyonunu artırdım
    
    // Başlık
    this.setColor('primary');
    this.setFont('heading', 'h2');
    this.pdf.text(turkishToAscii("Test Sonuçları"), this.marginLeft, startY);

    // Alt çizgi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, startY + 5, this.marginLeft + 100, startY + 5);
    
    // Sonuç kutusu
    const boxY = startY + 20;
    const boxHeight = 100; // Kutu yüksekliğini artırdım
    this.drawRoundedRect(this.marginLeft, boxY, this.contentWidth, boxHeight, 'lightGray');
    
    // Skor
    this.setColor('primary');
    this.setFont('heading', 'h1');
    const scoreText = turkishToAscii(`${this.result.score}`);
    this.pdf.text(scoreText, this.marginLeft + 30, boxY + 45);
    
    // Skor açıklaması - X pozisyonunu artırdım
    this.setColor('text');
    this.setFont('body', 'normal');
    let interpretation = "";
    
    // Basit bir skor yorumlama örneği
    if (this.result.score >= 80) {
      interpretation = "Mükemmel";
    } else if (this.result.score >= 60) {
      interpretation = "İyi";
    } else if (this.result.score >= 40) {
      interpretation = "Orta";
        } else {
      interpretation = "Geliştirilmesi gerekiyor";
    }
    
    const interpretationText = turkishToAscii(`Değerlendirme: ${interpretation}`);
    this.pdf.text(interpretationText, this.marginLeft + 120, boxY + 45);
    
    // Ek açıklama
    this.setFont('body', 'small');
    const additionalInfo = turkishToAscii("Bu sonuç, testin tamamlanma süresine ve verilen cevapların doğruluğuna göre hesaplanmıştır.");
    this.pdf.text(additionalInfo, this.marginLeft + 20, boxY + 80);
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - 25;
        
        // Alt çizgi
    this.pdf.setDrawColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, footerY - 10, this.pageWidth - this.marginRight, footerY - 10);
    
    this.setFont('body', 'small');
    this.setColor('textLight');
    
    // Rapor bilgileri
    const date = new Date(this.result.created_at);
    const dateTimeStr = turkishToAscii(date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    const reportInfo = turkishToAscii(`Rapor No: ${this.result.id.slice(0, 8).toUpperCase()} | ${dateTimeStr}`);
    this.pdf.text(reportInfo, this.marginLeft, footerY);
    
    // Yasal uyarı 
    const disclaimer = turkishToAscii('© 2025 Tüm hakları saklıdır. Bu rapor klinik değerlendirme için uzman görüşü ile birlikte kullanılmalıdır.');
    this.pdf.text(disclaimer, this.pageWidth - this.marginRight, footerY, { align: 'right' });
  }
}

export function generateTestPDF(
  test: Test,
  result: TestResult,
  client: Client,
  professional: Professional
): jsPDF {
  const generator = new TestPDFGenerator(test, result, client, professional);
  return generator.generate();
} 