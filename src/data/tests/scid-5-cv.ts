import { Test } from './types';

// Test başlangıç açıklaması
export const scid5CvIntro = `
SCID-5-CV (DSM-5 için Yapılandırılmış Klinik Görüşme - Klinik Versiyon), 
ruh sağlığı uzmanları tarafından DSM-5 tanı kriterlerine göre psikiyatrik bozuklukları 
değerlendirmek için kullanılan yarı yapılandırılmış bir klinik görüşme aracıdır.

Bu test, ruh sağlığı uzmanı tarafından uygulanmalıdır ve hastanın cevaplarına göre 
uzman tarafından puanlanır. Test, çeşitli psikiyatrik bozuklukları değerlendiren 
modüllerden oluşmaktadır.
`;

export const scid5CvTest: Test = {
  id: 'scid-5-cv',
  name: 'SCID-5-CV (DSM-5 için Yapılandırılmış Klinik Görüşme - Klinik Versiyon)',
  description: scid5CvIntro,
  infoText: 'Bu test, ruh sağlığı uzmanı tarafından uygulanmalıdır. DSM-5 tanı kriterlerine göre psikiyatrik bozuklukları değerlendirmek için kullanılır.',
  
  // SCID-5-CV'de her modül için örnek sorular (gerçek testte çok daha fazla soru vardır)
  questions: [
    {
      id: 'A1',
      text: 'Modül A: Depresif dönem - Depresif duygudurum',
      options: [
        { value: 0, text: 'Bilgi yetersiz' },
        { value: 1, text: 'Yok veya eşik altı' },
        { value: 2, text: 'Eşik altı' },
        { value: 3, text: 'Eşik veya eşik üstü' }
      ]
    },
    {
      id: 'A2',
      text: 'Modül A: Depresif dönem - İlgi kaybı veya haz alamama',
      options: [
        { value: 0, text: 'Bilgi yetersiz' },
        { value: 1, text: 'Yok veya eşik altı' },
        { value: 2, text: 'Eşik altı' },
        { value: 3, text: 'Eşik veya eşik üstü' }
      ]
    },
    {
      id: 'B1',
      text: 'Modül B: Psikotik belirtiler - Sanrılar',
      options: [
        { value: 0, text: 'Bilgi yetersiz' },
        { value: 1, text: 'Yok veya eşik altı' },
        { value: 2, text: 'Eşik altı' },
        { value: 3, text: 'Eşik veya eşik üstü' }
      ]
    },
    {
      id: 'B2',
      text: 'Modül B: Psikotik belirtiler - Halüsinasyonlar',
      options: [
        { value: 0, text: 'Bilgi yetersiz' },
        { value: 1, text: 'Yok veya eşik altı' },
        { value: 2, text: 'Eşik altı' },
        { value: 3, text: 'Eşik veya eşik üstü' }
      ]
    },
    // Diğer modüller için örnek sorular eklenebilir
  ],

  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  
  interpretScore: (score) => {
    return 'Değerlendirme tamamlandı';
  },
  
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    return {
      score: totalScore,
      severityLevel: 'Değerlendirme tamamlandı',
      factorScores: {},
      factorAverages: {},
      riskFactors: [],
      requiresTreatment: false
    };
  }
}; 