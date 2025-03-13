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

// Puanlama kriterleri ve açıklamalar
export const scid5CvCriteria = {
  modules: {
    A: { name: 'Duygudurum Epizodları', description: 'Major depresif bozukluk, manik epizod, hipomanik epizod vb.' },
    B: { name: 'Psikotik Belirtiler', description: 'Şizofreni, şizoaffektif bozukluk, sanrısal bozukluk vb.' },
    C: { name: 'Diferansiyel Tanı', description: 'Psikotik bozuklukların ayırıcı tanısı' },
    D: { name: 'Duygudurum Bozuklukları', description: 'Bipolar bozukluk, depresif bozukluk vb.' },
    E: { name: 'Madde Kullanım Bozuklukları', description: 'Alkol ve diğer madde kullanım bozuklukları' },
    F: { name: 'Anksiyete Bozuklukları', description: 'Panik bozukluk, agorafobi, sosyal anksiyete bozukluğu vb.' },
    G: { name: 'Obsesif-Kompulsif Bozukluk ve İlişkili Bozukluklar', description: 'OKB, beden dismorfik bozukluk vb.' },
    H: { name: 'Travma ve Stresörle İlişkili Bozukluklar', description: 'TSSB, akut stres bozukluğu vb.' },
    I: { name: 'Disosiyatif Bozukluklar', description: 'Disosiyatif kimlik bozukluğu, depersonalizasyon/derealizasyon bozukluğu vb.' },
    J: { name: 'Somatik Belirti Bozuklukları', description: 'Somatik belirti bozukluğu, hastalık anksiyetesi bozukluğu vb.' },
    K: { name: 'Yeme Bozuklukları', description: 'Anoreksiya nervoza, bulimiya nervoza vb.' },
    L: { name: 'Uyku Bozuklukları', description: 'İnsomni bozukluğu, hipersomni bozukluğu vb.' }
  },
  scoring: {
    '?': { value: 0, description: 'Bilgi yetersiz' },
    '1': { value: 1, description: 'Yok veya eşik altı' },
    '2': { value: 2, description: 'Eşik altı (alt klinik)' },
    '3': { value: 3, description: 'Eşik veya eşik üstü (klinik olarak anlamlı)' }
  },
  notes: [
    'SCID-5-CV, DSM-5 tanı kriterlerine göre psikiyatrik bozuklukları değerlendirmek için kullanılır.',
    'Test, ruh sağlığı uzmanı tarafından uygulanmalıdır.',
    'Her modül, ilgili bozukluk için DSM-5 tanı kriterlerini içerir.',
    'Puanlama, her bir kriter için 1 (yok), 2 (eşik altı) veya 3 (eşik veya eşik üstü) şeklinde yapılır.',
    'Tanı, DSM-5 kriterlerine göre belirlenir.'
  ]
};

export const scid5CvTest: Test = {
  id: 'scid-5-cv',
  name: 'SCID-5-CV (DSM-5 için Yapılandırılmış Klinik Görüşme - Klinik Versiyon)',
  description: scid5CvIntro,
  infoText: 'Bu test, ruh sağlığı uzmanı tarafından uygulanmalıdır. Uzman, görüşme sırasında hastanın cevaplarına göre her bir kriteri değerlendirir ve puanlar.',
  
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

  // Puanlama fonksiyonu
  calculateScore: (answers: Record<string, number>) => {
    // SCID-5-CV'de toplam puan hesaplanmaz, tanılar DSM-5 kriterlerine göre belirlenir
    // Ancak burada modül bazında pozitif kriter sayısını hesaplayabiliriz
    return Object.values(answers).filter(value => value === 3).length;
  },

  // Puanı yorumlama fonksiyonu
  interpretScore: (score: number) => {
    return `Toplam ${score} kriter eşik veya eşik üstü (klinik olarak anlamlı) olarak değerlendirilmiştir. Tanılar DSM-5 kriterlerine göre belirlenmelidir.`;
  },

  // Rapor oluşturma fonksiyonu
  generateReport: (answers: Record<string, number>) => {
    // Modül bazında pozitif kriter sayılarını hesapla
    const moduleScores: Record<string, number> = {};
    const modulePositives: Record<string, string[]> = {};
    
    Object.entries(answers).forEach(([key, value]) => {
      const moduleKey = key.charAt(0);
      if (!moduleScores[moduleKey]) {
        moduleScores[moduleKey] = 0;
        modulePositives[moduleKey] = [];
      }
      
      if (value === 3) {
        moduleScores[moduleKey]++;
        const question = scid5CvTest.questions.find(q => q.id === key);
        if (question) {
          modulePositives[moduleKey].push(question.text || key);
        }
      }
    });

    // Toplam pozitif kriter sayısı
    const totalPositiveCriteria = Object.values(moduleScores).reduce((sum, score) => sum + score, 0);
    
    // Olası tanıları belirle (bu basitleştirilmiş bir örnektir, gerçek SCID-5-CV'de daha karmaşık tanı algoritmaları kullanılır)
    const possibleDiagnoses: string[] = [];
    
    if (moduleScores['A'] >= 5 && (answers['A1'] === 3 || answers['A2'] === 3)) {
      possibleDiagnoses.push('Major Depresif Bozukluk için kriterler karşılanıyor olabilir');
    }
    
    if (moduleScores['B'] >= 2 && answers['B1'] === 3) {
      possibleDiagnoses.push('Psikotik Bozukluk için kriterler karşılanıyor olabilir');
    }

    return {
      score: totalPositiveCriteria,
      totalScore: totalPositiveCriteria,
      severityLevel: totalPositiveCriteria > 0 ? 'Klinik değerlendirme gerekli' : 'Belirgin patoloji saptanmadı',
      requiresTreatment: totalPositiveCriteria > 0,
      factorScores: moduleScores,
      factorAverages: Object.entries(moduleScores).reduce((acc, [key, value]) => {
        const moduleQuestionCount = Object.keys(answers).filter(q => q.charAt(0) === key).length;
        acc[key] = moduleQuestionCount > 0 ? value / moduleQuestionCount : 0;
        return acc;
      }, {} as Record<string, number>),
      riskFactors: [
        answers['B1'] === 3 ? 'Sanrılar mevcut' : '',
        answers['B2'] === 3 ? 'Halüsinasyonlar mevcut' : ''
      ].filter(Boolean),
      prominentSymptoms: Object.entries(answers)
        .filter(([_, value]) => value === 3)
        .map(([key]) => {
          const question = scid5CvTest.questions.find(q => q.id === key);
          return {
            question: parseInt(key.substring(1)),
            severity: 3,
            response: question?.text || key
          };
        }),
      interpretation: {
        overall: `SCID-5-CV değerlendirmesinde toplam ${totalPositiveCriteria} kriter klinik olarak anlamlı düzeyde pozitif bulunmuştur.`,
        factors: Object.entries(moduleScores)
          .filter(([_, score]) => score > 0)
          .map(([module, score]) => {
            const moduleName = scid5CvCriteria.modules[module as keyof typeof scid5CvCriteria.modules]?.name || `Modül ${module}`;
            return `${moduleName}: ${score} pozitif kriter`;
          })
          .join('\n'),
        risks: possibleDiagnoses.length > 0 
          ? `Olası tanılar: ${possibleDiagnoses.join(', ')}`
          : 'Belirgin tanı kriteri karşılanmamaktadır.',
        symptoms: Object.entries(modulePositives)
          .filter(([_, symptoms]) => symptoms.length > 0)
          .map(([module, symptoms]) => {
            const moduleName = scid5CvCriteria.modules[module as keyof typeof scid5CvCriteria.modules]?.name || `Modül ${module}`;
            return `${moduleName}:\n${symptoms.map(s => `- ${s}`).join('\n')}`;
          })
          .join('\n\n'),
        recommendations: [
          totalPositiveCriteria > 0 ? 'Kapsamlı klinik değerlendirme önerilir.' : 'Rutin takip önerilir.',
          possibleDiagnoses.length > 0 ? 'DSM-5 kriterlerine göre tanı değerlendirmesi yapılmalıdır.' : '',
          moduleScores['B'] > 0 ? 'Psikotik belirtiler için detaylı değerlendirme gereklidir.' : ''
        ].filter(Boolean)
      }
    };
  }
}; 