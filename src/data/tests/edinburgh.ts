import { Test } from './types';

// Test başlangıç açıklaması
export const edinburghIntro = `
Yakın zamanlarda bebeğiniz oldu. Sizin son hafta içindeki duygularınızı öğrenmek istiyoruz. 
Lütfen tüm soruları yalnızca bugün için değil, son 7 gün içinde, kendinizi nasıl hissettiğinizi 
en iyi tanımlayan ifadeyi işaretleyiniz.
`;

// Puanlama kriterleri ve açıklamalar
export const edinburghCriteria = {
  scoring: {
    normal: { min: 0, max: 12, description: 'Normal düzey' },
    depression: { min: 13, max: 30, description: 'Depresyon riski' }
  },
  cutoffScore: 12,
  interpretation: [
    '0-12 puan: Normal düzey',
    '13 ve üzeri puan: Depresyon riski (Sevk gerektirir)'
  ],
  notes: [
    'Edinburgh Doğum Sonrası Depresyon Ölçeği (EDSDÖ), doğum sonrası depresyon riskini belirlemek için kullanılır.',
    'Son 7 gün içindeki durumu değerlendirir.',
    'Her madde 0-3 arası puanlanır.',
    'Toplam puan 0-30 arasında değişir.',
    'Kesme puanı 12/13\'tür. 13 ve üzeri puan depresyon riskini gösterir.',
    '3., 5., 6., 7., 8., 9., ve 10. maddeler 3,2,1,0 şeklinde puanlanır.',
    '1., 2. ve 4. maddeler 0,1,2,3 şeklinde puanlanır.'
  ]
};

export const edinburghTest: Test = {
  id: 'edinburgh',
  name: 'Edinburgh Doğum Sonrası Depresyon Ölçeği',
  description: edinburghIntro,
  questions: [
    {
      id: 'ED1',
      text: 'Gülebiliyor ve olayların komik taraflarını görebiliyorum.',
      options: [
        { value: 0, text: 'Her zaman olduğu kadar' },
        { value: 1, text: 'Artık pek o kadar değil' },
        { value: 2, text: 'Artık kesinlikle o kadar değil' },
        { value: 3, text: 'Artık hiç değil' }
      ]
    },
    {
      id: 'ED2',
      text: 'Geleceğe hevesle bakıyorum.',
      options: [
        { value: 0, text: 'Her zaman olduğu kadar' },
        { value: 1, text: 'Artık pek o kadar değil' },
        { value: 2, text: 'Artık kesinlikle o kadar değil' },
        { value: 3, text: 'Artık hiç değil' }
      ]
    },
    {
      id: 'ED3',
      text: 'Bir şeyler kötü gittiğinde gereksiz yere kendimi suçluyorum.',
      options: [
        { value: 3, text: 'Evet, çoğu zaman' },
        { value: 2, text: 'Evet, bazen' },
        { value: 1, text: 'Çok sık değil' },
        { value: 0, text: 'Hayır, hiçbir zaman' }
      ]
    },
    {
      id: 'ED4',
      text: 'Nedensiz yere kendimi sıkıntılı ya da endişeli hissediyorum.',
      options: [
        { value: 0, text: 'Hayır, hiçbir zaman' },
        { value: 1, text: 'Çok seyrek' },
        { value: 2, text: 'Evet, bazen' },
        { value: 3, text: 'Evet, çoğu zaman' }
      ]
    },
    {
      id: 'ED5',
      text: 'İyi bir neden olmadığı halde korkuyor ya da panikliyorum.',
      options: [
        { value: 3, text: 'Evet, çoğu zaman' },
        { value: 2, text: 'Evet, bazen' },
        { value: 1, text: 'Çok sık değil' },
        { value: 0, text: 'Hayır, hiçbir zaman' }
      ]
    },
    {
      id: 'ED6',
      text: 'Her şey giderek sırtıma yükleniyor.',
      options: [
        { value: 3, text: 'Evet, çoğu zaman hiç başa çıkamıyorum' },
        { value: 2, text: 'Evet, bazen eskisi gibi başa çıkamıyorum' },
        { value: 1, text: 'Hayır, çoğu zaman oldukça iyi başa çıkabiliyorum' },
        { value: 0, text: 'Hayır, her zamanki gibi başa çıkabiliyorum' }
      ]
    },
    {
      id: 'ED7',
      text: 'Öylesine mutsuzum ki uyumakta zorlanıyorum.',
      options: [
        { value: 3, text: 'Evet, çoğu zaman' },
        { value: 2, text: 'Evet, bazen' },
        { value: 1, text: 'Çok sık değil' },
        { value: 0, text: 'Hayır, hiçbir zaman' }
      ]
    },
    {
      id: 'ED8',
      text: 'Kendimi üzüntülü ya da çökkün hissediyorum.',
      options: [
        { value: 3, text: 'Evet, çoğu zaman' },
        { value: 2, text: 'Evet, bazen' },
        { value: 1, text: 'Çok sık değil' },
        { value: 0, text: 'Hayır, hiçbir zaman' }
      ]
    },
    {
      id: 'ED9',
      text: 'Öylesine mutsuzum ki ağlıyorum.',
      options: [
        { value: 3, text: 'Evet, çoğu zaman' },
        { value: 2, text: 'Evet, oldukça sık' },
        { value: 1, text: 'Çok seyrek' },
        { value: 0, text: 'Hayır, asla' }
      ]
    },
    {
      id: 'ED10',
      text: 'Kendime zarar verme düşüncesinin aklıma geldiği oldu.',
      options: [
        { value: 3, text: 'Evet, oldukça sık' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Hemen hemen hiç' },
        { value: 0, text: 'Asla' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score <= edinburghCriteria.cutoffScore) 
      return edinburghCriteria.scoring.normal.description;
    return edinburghCriteria.scoring.depression.description;
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    // Risk düzeyini belirle
    let severityLevel = '';
    if (totalScore <= edinburghCriteria.cutoffScore) {
      severityLevel = edinburghCriteria.scoring.normal.description;
    } else {
      severityLevel = edinburghCriteria.scoring.depression.description;
    }

    // Risk faktörlerini belirle
    const riskFactors = [];
    if (totalScore >= 13) {
      riskFactors.push('Depresyon riski - Sevk gerektirir');
    }

    // Öne çıkan belirtileri belirle
    const prominentSymptoms = Object.entries(answers)
      .filter(([_, value]) => Number(value) >= 2)
      .map(([key]) => {
        const questionNumber = parseInt(key.replace('ED', ''));
        return {
          question: questionNumber,
          severity: Number(answers[key]),
          response: edinburghTest.questions[questionNumber - 1].text
        };
      });

    return {
      totalScore,
      severityLevel,
      factorScores: {},
      factorAverages: {},
      riskFactors,
      prominentSymptoms,
      requiresTreatment: totalScore >= 13,
      interpretation: {
        overall: `Danışanın Edinburgh Doğum Sonrası Depresyon Ölçeği toplam puanı ${totalScore} olup, bu puan "${severityLevel}" düzeyine işaret etmektedir.`,
        factors: `
          Önemli bulgular:
          - Toplam puan: ${totalScore}/30
          - Risk düzeyi: ${severityLevel}
          - Tedavi gereksinimi: ${totalScore >= 13 ? 'Var' : 'Yok'}
        `,
        risks: riskFactors.length > 0 
          ? `Önemli risk faktörleri: ${riskFactors.join(', ')}`
          : 'Belirgin risk faktörü saptanmamıştır.',
        symptoms: prominentSymptoms.length > 0
          ? `Öne çıkan belirtiler:\n${prominentSymptoms.map(s => `- ${s.response}`).join('\n')}`
          : 'Belirgin semptom saptanmamıştır.',
        recommendations: [
          totalScore >= 13 ? 'Psikiyatrik değerlendirme için sevk önerilir.' : 'Periyodik kontrol önerilir.'
        ].filter(r => r !== '')
      }
    };
  }
}; 