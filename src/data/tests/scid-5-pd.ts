import { Test } from './types';

// Test başlangıç açıklaması
export const scid5PdIntro = `
SCID-5-PD (DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları), 
ruh sağlığı uzmanları tarafından DSM-5 tanı kriterlerine göre kişilik bozukluklarını 
değerlendirmek için kullanılan yarı yapılandırılmış bir klinik görüşme aracıdır.

Bu test, ruh sağlığı uzmanı tarafından uygulanmalıdır ve hastanın cevaplarına göre 
uzman tarafından puanlanır. Test, DSM-5'te tanımlanan 10 kişilik bozukluğunu 
değerlendiren bölümlerden oluşmaktadır.
`;

export const scid5PdTest: Test = {
  id: 'scid-5-pd',
  name: 'SCID-5-PD (DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları)',
  description: scid5PdIntro,
  infoText: 'Bu test, ruh sağlığı uzmanı tarafından uygulanmalıdır. Uzman, görüşme sırasında hastanın cevaplarına göre her bir kriteri değerlendirir.',
  
  // SCID-5-PD'de her kişilik bozukluğu için örnek sorular (gerçek testte çok daha fazla soru vardır)
  questions: [
    {
      id: 'AVD1',
      text: 'Çekingen KB: Eleştirilme, reddedilme veya dışlanma korkusuyla yakın ilişki gerektiren mesleki aktivitelerden kaçınır',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    {
      id: 'AVD2',
      text: 'Çekingen KB: Sevilmediğinden emin olmadıkça insanlarla ilişkiye girmek istemez',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    {
      id: 'DEP1',
      text: 'Bağımlı KB: Günlük kararları başkalarından önemli ölçüde tavsiye ve güvence almadan veremez',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    {
      id: 'DEP2',
      text: 'Bağımlı KB: Hayatının çoğu alanında sorumluluk alması için başkalarına ihtiyaç duyar',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    {
      id: 'OCP1',
      text: 'Obsesif-Kompulsif KB: Düzen, organizasyon ve detaylarla aşırı uğraşır',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    {
      id: 'PAR1',
      text: 'Paranoid KB: Yeterli bir neden olmaksızın başkalarının kendisini sömürdüğünden, zarar verdiğinden veya aldattığından şüphelenir',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    {
      id: 'BOR1',
      text: 'Sınırda KB: Gerçek veya hayali bir terk edilmeden kaçınmak için çılgınca çabalar',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    {
      id: 'NAR1',
      text: 'Narsisistik KB: Kendisinin önemli ve özel biri olduğuna dair büyüklenmeci duygular',
      options: [
        { value: 1, text: '1 - Yok veya eşik altı' },
        { value: 2, text: '2 - Eşik altı' },
        { value: 3, text: '3 - Eşik veya eşik üstü' },
        { value: 0, text: '? - Bilgi yetersiz' }
      ]
    },
    // Diğer kişilik bozuklukları için örnek sorular eklenebilir
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