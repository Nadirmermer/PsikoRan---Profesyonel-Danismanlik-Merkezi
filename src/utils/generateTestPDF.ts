import jsPDF from 'jspdf';
import { Test } from '../data/tests/types';
import { setupFonts } from './fonts';

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

// Beyin logosu için SVG path
const BRAIN_LOGO_PATH = "M30 15C25.5817 15 22 18.5817 22 23C22 24.5192 22.4359 25.9612 23.1957 27.1993C22.4359 28.4374 22 29.8794 22 31.3986C22 35.8169 25.5817 39.3986 30 39.3986C31.5192 39.3986 32.9612 38.9627 34.1993 38.2029C35.4374 38.9627 36.8794 39.3986 38.3986 39.3986C42.8169 39.3986 46.3986 35.8169 46.3986 31.3986C46.3986 29.8794 45.9627 28.4374 45.2029 27.1993C45.9627 25.9612 46.3986 24.5192 46.3986 23C46.3986 18.5817 42.8169 15 38.3986 15C36.8794 15 35.4374 15.4359 34.1993 16.1957C32.9612 15.4359 31.5192 15 30 15ZM30 17.3986C31.1957 17.3986 32.3169 17.7599 33.2599 18.3986C32.6212 19.3416 32.2599 20.4628 32.2599 21.6585C32.2599 22.8542 32.6212 23.9754 33.2599 24.9184C32.3169 25.5571 31.1957 25.9184 30 25.9184C27.0558 25.9184 24.6585 23.5211 24.6585 20.5769C24.6585 17.6327 27.0558 15.2354 30 15.2354C31.1957 15.2354 32.3169 15.5967 33.2599 16.2354C32.3169 16.8741 31.1957 17.3986 30 17.3986ZM38.3986 17.3986C41.3428 17.3986 43.7401 19.7959 43.7401 22.7401C43.7401 25.6843 41.3428 28.0816 38.3986 28.0816C37.2029 28.0816 36.0817 27.7203 35.1387 27.0816C35.7774 26.1386 36.1387 25.0174 36.1387 23.8217C36.1387 22.626 35.7774 21.5048 35.1387 20.5618C36.0817 19.9231 37.2029 19.5618 38.3986 19.5618C41.3428 19.5618 43.7401 21.9591 43.7401 24.9033C43.7401 27.8475 41.3428 30.2448 38.3986 30.2448C37.2029 30.2448 36.0817 29.8835 35.1387 29.2448C35.7774 28.3018 36.1387 27.1806 36.1387 25.9849C36.1387 24.7892 35.7774 23.668 35.1387 22.725C36.0817 22.0863 37.2029 21.725 38.3986 21.725C35.4544 21.725 33.0571 19.3277 33.0571 16.3835C33.0571 13.4393 35.4544 11.042 38.3986 11.042C41.3428 11.042 43.7401 13.4393 43.7401 16.3835C43.7401 19.3277 41.3428 21.725 38.3986 21.725ZM30 28.0816C32.9442 28.0816 35.3415 30.4789 35.3415 33.4231C35.3415 36.3673 32.9442 38.7646 30 38.7646C27.0558 38.7646 24.6585 36.3673 24.6585 33.4231C24.6585 30.4789 27.0558 28.0816 30 28.0816ZM30 30.2448C28.8043 30.2448 27.6831 30.6061 26.7401 31.2448C26.0014 32.1878 25.6401 33.309 25.6401 34.5047C25.6401 35.7004 26.0014 36.8216 26.7401 37.7646C27.6831 38.4033 28.8043 38.7646 30 38.7646C31.1957 38.7646 32.3169 38.4033 33.2599 37.7646C33.9986 36.8216 34.3599 35.7004 34.3599 34.5047C34.3599 33.309 33.9986 32.1878 33.2599 31.2448C32.3169 30.6061 31.1957 30.2448 30 30.2448Z";

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
    // Logo arka planı
    this.pdf.setFillColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.roundedRect(x, y, width, height, 3, 3, 'F');
    
    // "P" harfi çiz (PsiRan'ın baş harfi)
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(36);
    this.pdf.text("P", x + width / 2, y + height / 2 + 12, { align: 'center' });
    
    // Logo altına "PsiRan" yazısı
    this.setColor('primary');
    this.setFont('heading', 'h3');
    this.pdf.text("PsiRan", x + width / 2, y + height + 15, { align: 'center' });
  }

  private drawHeader(): void {
    const headerHeight = 120; // Yüksekliği artırdım
    
    // Ana header container - beyaz arka plan
    this.drawRoundedRect(0, 0, this.pageWidth, headerHeight, 'white');
    
    // Üst kısımda ince bir çizgi
    this.pdf.setFillColor(THEME.colors.primary.r, THEME.colors.primary.g, THEME.colors.primary.b);
    this.pdf.rect(0, 0, this.pageWidth, 5, 'F');
    
    // Logo çiz
    this.drawLogo(this.marginLeft, 20, 60, 60);
    
    // Danışan adı
    const clientNameX = this.marginLeft + 80;
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