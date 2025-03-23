import { Test } from './types';

// Test başlangıç açıklaması
export const acyoIntro = `
Arizona Cinsel Yaşantılar Ölçeği (ACYÖ), 2000 yılında McGahuey, Gelenberg, Laukes, Moreno ve Delgoda tarafından geliştirilmiş olup orijinal ismi Arizona Sexual Experiences Scale'dir. 

Psikotrop ilaç kullanan hastalarda cinsel işlevlerde ortaya çıkan değişiklikler ve bozuklukları değerlendirmek amacıyla tasarlanan ölçek cinsel işlevin uyarılma, tahrik olma, penis sertleşmesi/vajina ıslanması, orgazma ulaşma yeteneği ve orgazmla ulaşılan tatmin şeklindeki cinsel işlevin beş temel bileşenini değerlendirmektedir.

Lütfen her madde için BUGÜN de dahil olmak üzere geçen haftaki durumunuzu işaretleyiniz.
`;

// Kadın formu soruları
const kadinFormuSorulari = [
  {
    id: 'ACYO_K1',
    moduleId: 'kadin',
    text: 'Cinsel açıdan ne kadar isteklisiniz?',
    options: [
      { value: 1, text: 'Oldukça istekli' },
      { value: 2, text: 'Çok istekli' },
      { value: 3, text: 'Biraz istekli' },
      { value: 4, text: 'Biraz isteksiz' },
      { value: 5, text: 'Çok isteksiz' },
      { value: 6, text: 'Tamamen isteksiz' }
    ]
  },
  {
    id: 'ACYO_K2',
    moduleId: 'kadin',
    text: 'Cinsel açıdan ne kadar kolay uyarılırsınız (tahrik olursunuz)?',
    options: [
      { value: 1, text: 'Oldukça kolay' },
      { value: 2, text: 'Çok kolay' },
      { value: 3, text: 'Biraz kolay' },
      { value: 4, text: 'Biraz zor' },
      { value: 5, text: 'Çok zor' },
      { value: 6, text: 'Oldukça zor' }
    ]
  },
  {
    id: 'ACYO_K3',
    moduleId: 'kadin',
    text: 'Cinsel organınız ilişki sırasında ne kadar kolay ıslanır veya nemlenir?',
    options: [
      { value: 1, text: 'Oldukça kolay' },
      { value: 2, text: 'Çok kolay' },
      { value: 3, text: 'Biraz kolay' },
      { value: 4, text: 'Biraz zor' },
      { value: 5, text: 'Çok zor' },
      { value: 6, text: 'Asla olmaz' }
    ]
  },
  {
    id: 'ACYO_K4',
    moduleId: 'kadin',
    text: 'Ne kadar kolay orgazm olursunuz?',
    options: [
      { value: 1, text: 'Oldukça kolay' },
      { value: 2, text: 'Çok kolay' },
      { value: 3, text: 'Biraz kolay' },
      { value: 4, text: 'Biraz zor' },
      { value: 5, text: 'Çok zor' },
      { value: 6, text: 'Asla boşalamam' }
    ]
  },
  {
    id: 'ACYO_K5',
    moduleId: 'kadin',
    text: 'Orgazmınız tatmin edici midir?',
    options: [
      { value: 1, text: 'Oldukça tatmin edici' },
      { value: 2, text: 'Çok tatmin edici' },
      { value: 3, text: 'Biraz tatmin edici' },
      { value: 4, text: 'Pek tatmin etmiyor' },
      { value: 5, text: 'Çok tatmin etmiyor' },
      { value: 6, text: 'Orgazma ulaşamam' }
    ]
  }
];

// Erkek formu soruları
const erkekFormuSorulari = [
  {
    id: 'ACYO_E1',
    moduleId: 'erkek',
    text: 'Cinsel açıdan ne kadar isteklisiniz?',
    options: [
      { value: 1, text: 'Oldukça istekli' },
      { value: 2, text: 'Çok istekli' },
      { value: 3, text: 'Biraz istekli' },
      { value: 4, text: 'Biraz isteksiz' },
      { value: 5, text: 'Çok isteksiz' },
      { value: 6, text: 'Tamamen isteksiz' }
    ]
  },
  {
    id: 'ACYO_E2',
    moduleId: 'erkek',
    text: 'Cinsel açıdan ne kadar kolay uyarılırsınız (tahrik olursunuz)?',
    options: [
      { value: 1, text: 'Oldukça kolay' },
      { value: 2, text: 'Çok kolay' },
      { value: 3, text: 'Biraz kolay' },
      { value: 4, text: 'Biraz zor' },
      { value: 5, text: 'Çok zor' },
      { value: 6, text: 'Oldukça zor' }
    ]
  },
  {
    id: 'ACYO_E3',
    moduleId: 'erkek',
    text: 'Penisiniz/ cinsel organınız kolayca sertleşir ve sertliğini sürdürür mü?',
    options: [
      { value: 1, text: 'Oldukça kolay' },
      { value: 2, text: 'Çok kolay' },
      { value: 3, text: 'Biraz kolay' },
      { value: 4, text: 'Biraz zor' },
      { value: 5, text: 'Çok zor' },
      { value: 6, text: 'Asla olmaz' }
    ]
  },
  {
    id: 'ACYO_E4',
    moduleId: 'erkek',
    text: 'Ne kadar kolay boşalırsınız?',
    options: [
      { value: 1, text: 'Oldukça kolay' },
      { value: 2, text: 'Çok kolay' },
      { value: 3, text: 'Biraz kolay' },
      { value: 4, text: 'Biraz zor' },
      { value: 5, text: 'Çok zor' },
      { value: 6, text: 'Asla boşalamam' }
    ]
  },
  {
    id: 'ACYO_E5',
    moduleId: 'erkek',
    text: 'Boşalmanız tatmin edici midir?',
    options: [
      { value: 1, text: 'Oldukça tatmin edici' },
      { value: 2, text: 'Çok tatmin edici' },
      { value: 3, text: 'Biraz tatmin edici' },
      { value: 4, text: 'Pek tatmin etmiyor' },
      { value: 5, text: 'Çok tatmin etmiyor' },
      { value: 6, text: 'Hiç boşalamam' }
    ]
  }
];

// Arizona Cinsel Yaşantılar Ölçeği modülleri
const acyoModules = [
  {
    id: 'kadin',
    name: 'Kadın Formu',
    description: 'Arizona Cinsel Yaşantılar Ölçeği Kadın Formu',
    questions: kadinFormuSorulari.map(q => q.id)
  },
  {
    id: 'erkek',
    name: 'Erkek Formu',
    description: 'Arizona Cinsel Yaşantılar Ölçeği Erkek Formu',
    questions: erkekFormuSorulari.map(q => q.id)
  }
];

// Test tanımı
export const arizonaCinselYasantilarTest: Test = {
  id: 'acyo',
  name: 'Arizona Cinsel Yaşantılar Ölçeği (ACYÖ)',
  description: acyoIntro,
  infoText: 'Bu ölçek, cinsel işlevin uyarılma, tahrik olma, penis sertleşmesi/vajina ıslanması, orgazma ulaşma yeteneği ve orgazmla ulaşılan tatmin şeklindeki cinsel işlevin beş temel bileşenini değerlendirmektedir. Kadın ve erkek hastalara ayrı ayrı kullanılabilen iki formu bulunmaktadır.',
  reference: 'Soykan, A. (2004). The reliability and validity of Arizona sexual experiences scale in Turkish ESRD patients undergoing hemodialysis. International Journal of Impotence Research, 16(6), 531-534.',
  isModular: true,
  modules: acyoModules,
  questions: [...kadinFormuSorulari, ...erkekFormuSorulari],

  // Puan hesaplama fonksiyonu
  calculateScore: (answers: Record<string, number>) => {
    const erkekAnswers = Object.entries(answers).filter(([key]) => key.startsWith('ACYO_E'));
    const kadinAnswers = Object.entries(answers).filter(([key]) => key.startsWith('ACYO_K'));
    
    if (erkekAnswers.length > kadinAnswers.length) {
      // Erkek formu kullanılmış
      return erkekAnswers.reduce((total, [_, value]) => total + value, 0);
    } else {
      // Kadın formu kullanılmış
      return kadinAnswers.reduce((total, [_, value]) => total + value, 0);
    }
  },

  // Puan yorumlama fonksiyonu
  interpretScore: (score: number) => {
    if (score <= 10) {
      return 'Düşük puan: Gelişmiş cinsel işlev göstergesi.';
    } else if (score <= 18) {
      return 'Orta puan: Hafif düzeyde cinsel işlev bozukluğu.';
    } else {
      return 'Yüksek puan: Belirgin cinsel işlev bozukluğu.';
    }
  },

  // Rapor oluşturma fonksiyonu
  generateReport: (answers: Record<string, number>) => {
    // Hangi formun kullanıldığını belirle
    const erkekAnswers = Object.entries(answers).filter(([key]) => key.startsWith('ACYO_E'));
    const kadinAnswers = Object.entries(answers).filter(([key]) => key.startsWith('ACYO_K'));
    const isErkekForm = erkekAnswers.length > kadinAnswers.length;
    
    const formAnswers = isErkekForm ? erkekAnswers : kadinAnswers;
    const score = formAnswers.reduce((total, [_, value]) => total + value, 0);
    
    // Yorumla
    let severityLevel = 'Normal';
    let requiresTreatment = false;
    
    if (score <= 10) {
      severityLevel = 'Normal';
      requiresTreatment = false;
    } else if (score <= 18) {
      severityLevel = 'Hafif';
      requiresTreatment = false;
    } else if (score <= 24) {
      severityLevel = 'Orta';
      requiresTreatment = true;
    } else {
      severityLevel = 'Ciddi';
      requiresTreatment = true;
    }
    
    // Modül puanlarını ve grafik verilerini oluştur
    const formName = isErkekForm ? 'erkek' : 'kadin';
    const factorScores = {
      [formName]: score
    };
    
    const labels = isErkekForm 
      ? ['Cinsel istek', 'Cinsel uyarılma', 'Sertleşme', 'Boşalma kolaylığı', 'Boşalma tatmini']
      : ['Cinsel istek', 'Cinsel uyarılma', 'Vajinal ıslanma', 'Orgazm olma', 'Orgazm tatmini'];
    
    return {
      score: score,
      factorAverages: {
        [formName]: score / 5
      },
      factorScores,
      severityLevel,
      requiresTreatment,
      riskFactors: score > 18 ? ['Cinsel işlev bozukluğu riski'] : [],
      solvedModules: [formName],
      chartData: {
        labels,
        datasets: [
          {
            label: 'Puan',
            data: formAnswers.map(([_, value]) => value),
            backgroundColor: { r: 75, g: 192, b: 192 }
          }
        ]
      }
    };
  }
}; 