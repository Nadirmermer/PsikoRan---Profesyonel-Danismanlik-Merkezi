import { Test } from './types';

// Test başlangıç açıklaması
export const ytt40Intro = `
Aşağıda yeme tutumları ile ilgili çeşitli ifadeler bulunmaktadır. Her ifadeyi dikkatlice okuyun ve size en uygun gelen seçeneği işaretleyin.
`;

// Puanlama kriterleri ve açıklamalar
export const ytt40Criteria = {
  scoring: {
    minimal: { min: 0, max: 21, description: 'Normal yeme tutumu' },
    mild: { min: 22, max: 29, description: 'Hafif düzeyde bozulmuş yeme tutumu' },
    moderate: { min: 30, max: 39, description: 'Orta düzeyde bozulmuş yeme tutumu' },
    severe: { min: 40, max: 120, description: 'Şiddetli düzeyde bozulmuş yeme tutumu' }
  },
  interpretation: [
    'Toplam puan 0-21 arası: Normal yeme tutumu',
    'Toplam puan 22-29 arası: Hafif düzeyde bozulmuş yeme tutumu',
    'Toplam puan 30-39 arası: Orta düzeyde bozulmuş yeme tutumu',
    'Toplam puan 40 ve üzeri: Şiddetli düzeyde bozulmuş yeme tutumu'
  ],
  notes: [
    'YTT-40, yeme tutumlarını ve davranışlarını değerlendirmek için kullanılan 40 maddelik bir ölçektir.',
    'Her madde 1-6 arası puanlanır.',
    'Toplam puan 0-120 arasında değişir.',
    'Kesme puanı 30 olarak belirlenmiştir.',
    'Yüksek puanlar bozulmuş yeme tutumuna işaret eder.'
  ]
};

export const ytt40Test: Test = {
  id: 'ytt40',
  name: 'Yeme Tutum Testi (YTT-40)',
  description: ytt40Intro,
  questions: [
    {
      id: 'YTT1',
      text: 'Başkaları ile birlikte yemek yemekten hoşlanırım.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT2',
      text: 'Başkaları için yemek pişiririm, fakat pişirdiğim yemeği yemem',
      options: [
        { value: 5, text: 'Her zaman' },
        { value: 4, text: 'Çok sık' },
        { value: 3, text: 'Sık sık' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT3',
      text: 'Yemekten önce sıkıntılı olurum',
      options: [
        { value: 5, text: 'Her zaman' },
        { value: 4, text: 'Çok sık' },
        { value: 3, text: 'Sık sık' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score <= ytt40Criteria.scoring.minimal.max) 
      return ytt40Criteria.scoring.minimal.description;
    if (score <= ytt40Criteria.scoring.mild.max) 
      return ytt40Criteria.scoring.mild.description;
    if (score <= ytt40Criteria.scoring.moderate.max) 
      return ytt40Criteria.scoring.moderate.description;
    return ytt40Criteria.scoring.severe.description;
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    // Şiddet düzeyini belirle
    let severityLevel = '';
    if (totalScore <= ytt40Criteria.scoring.minimal.max) {
      severityLevel = ytt40Criteria.scoring.minimal.description;
    } else if (totalScore <= ytt40Criteria.scoring.mild.max) {
      severityLevel = ytt40Criteria.scoring.mild.description;
    } else if (totalScore <= ytt40Criteria.scoring.moderate.max) {
      severityLevel = ytt40Criteria.scoring.moderate.description;
    } else {
      severityLevel = ytt40Criteria.scoring.severe.description;
    }

    // Öne çıkan belirtileri belirle
    const prominentSymptoms = Object.entries(answers)
      .filter(([_, value]) => Number(value) >= 2)
      .map(([key]) => {
        const questionNumber = parseInt(key.replace('YTT', ''));
        return {
          question: questionNumber,
          severity: Number(answers[key]),
          response: ytt40Test.questions[questionNumber - 1].text
        };
      });

    return {
      totalScore,
      severityLevel,
      factorScores: {},
      factorAverages: {},
      riskFactors: [],
      prominentSymptoms,
      requiresTreatment: totalScore >= 30,
      interpretation: {
        overall: `Danışanın YTT-40 toplam puanı ${totalScore} olup, bu puan "${severityLevel}" düzeyine işaret etmektedir.`,
        factors: `
          Toplam puan: ${totalScore}/120
          Şiddet düzeyi: ${severityLevel}
          Tedavi gereksinimi: ${totalScore >= 30 ? 'Var' : 'Yok'}
        `,
        risks: 'Belirgin risk faktörü saptanmamıştır.',
        symptoms: prominentSymptoms.length > 0
          ? `Öne çıkan belirtiler:\n${prominentSymptoms.map(s => `- ${s.response}`).join('\n')}`
          : 'Belirgin semptom saptanmamıştır.',
        recommendations: [
          totalScore >= 40 ? 'Acil psikiyatrik değerlendirme önerilir.' : '',
          totalScore >= 30 ? 'Klinik değerlendirme önerilir.' : 'Periyodik kontrol önerilir.'
        ].filter(r => r !== '')
      }
    };
  }
}; 