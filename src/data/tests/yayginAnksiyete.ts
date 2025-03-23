import { Test } from './types';

export const yayginAnksiyeteTest: Test = {
  id: 'yaygin-anksiyete',
  name: 'Yaygın Anksiyete Bozukluğu-7 Testi (GAD-7)',
  description: 'Bireylerdeki yaygın anksiyete belirtilerini taramak amacıyla kullanılan 7 soruluk bir özbildirim aracı.',
  instructions: 'Son 2 hafta içinde aşağıdaki sorunlardan her biri sizi ne sıklıkla rahatsız etti? Lütfen her soru için uygun seçeneği işaretleyiniz.',
  infoText: 'Yaygın Anksiyete Bozukluğu-7 Testi (GAD-7), yaygın anksiyete belirtilerini taramak amacıyla kullanılan kısa bir ölçektir. Bu test, sık görülen anksiyete belirtilerinin varlığını ve şiddetini değerlendirmek için tasarlanmıştır. Spitzer ve arkadaşları tarafından 2006 yılında, Generalizet Anxiety Disorder -7 (GAD7) ismi ile geliştirilen ölçeğin, Türkçe uyarlaması, geçerlilik ve güvenilirlik çalışması Konkan ve arkadaşları tarafından 2013 yılında gerçekleştirilmiştir. Ölçeğin iç tutarlılığı için cronbach alpha değeri 0,85, madde toplam puan korelasyon katsayıları 0.39-0.720 arasında, RMSEA 0.018, CFI 0.998, GFI 0.965, kesme puanı 8 olarak belirlenmiştir.',
  reference: 'Konkan ve arkadaşları (2013)',
  questions: [
    {
      id: 'q1',
      text: 'Sinirli, kaygılı ve endişeli misiniz?',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Birkaç gün' },
        { value: 2, text: 'Günlerin yarısından fazlasında' },
        { value: 3, text: 'Hemen her gün' }
      ]
    },
    {
      id: 'q2',
      text: 'Kaygılarınızı kontrol edememe ya da durduramama',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Birkaç gün' },
        { value: 2, text: 'Günlerin yarısından fazlasında' },
        { value: 3, text: 'Hemen her gün' }
      ]
    },
    {
      id: 'q3',
      text: 'Farklı konularda çok fazla endişelenme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Birkaç gün' },
        { value: 2, text: 'Günlerin yarısından fazlasında' },
        { value: 3, text: 'Hemen her gün' }
      ]
    },
    {
      id: 'q4',
      text: 'Gevşeyip rahatlayamama',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Birkaç gün' },
        { value: 2, text: 'Günlerin yarısından fazlasında' },
        { value: 3, text: 'Hemen her gün' }
      ]
    },
    {
      id: 'q5',
      text: 'Yerinizde duramayacak kadar kıpır kıpır huzursuz olma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Birkaç gün' },
        { value: 2, text: 'Günlerin yarısından fazlasında' },
        { value: 3, text: 'Hemen her gün' }
      ]
    },
    {
      id: 'q6',
      text: 'Çabuk sinirlenme, kızma ya da huzursuz olma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Birkaç gün' },
        { value: 2, text: 'Günlerin yarısından fazlasında' },
        { value: 3, text: 'Hemen her gün' }
      ]
    },
    {
      id: 'q7',
      text: 'Çok kötü bir şey olacak diye korkma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Birkaç gün' },
        { value: 2, text: 'Günlerin yarısından fazlasında' },
        { value: 3, text: 'Hemen her gün' }
      ]
    }
  ],
  calculateScore: (answers) => {
    // Toplam puanı hesapla
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    return totalScore;
  },
  interpretScore: (score) => {
    if (score >= 0 && score <= 4) {
      return 'Minimal anksiyete';
    } else if (score >= 5 && score <= 9) {
      return 'Hafif anksiyete';
    } else if (score >= 10 && score <= 14) {
      return 'Orta derecede anksiyete';
    } else {
      return 'Şiddetli anksiyete';
    }
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    
    let severityLevel = '';
    
    if (totalScore >= 0 && totalScore <= 4) {
      severityLevel = 'Minimal anksiyete';
    } else if (totalScore >= 5 && totalScore <= 9) {
      severityLevel = 'Hafif anksiyete';
    } else if (totalScore >= 10 && totalScore <= 14) {
      severityLevel = 'Orta derecede anksiyete';
    } else {
      severityLevel = 'Şiddetli anksiyete';
    }
    
    // Arayüz gereksinimlerini karşılamak için boş değerler
    return {
      score: totalScore,
      factorAverages: {}, // Boş bir nesne
      severityLevel: severityLevel,
      requiresTreatment: totalScore >= 10, // 10 ve üzeri puanlarda tedavi gerekli olarak işaretlenir
      riskFactors: [] // Boş bir dizi
    };
  }
}; 