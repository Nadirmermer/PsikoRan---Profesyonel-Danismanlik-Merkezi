import { Test } from './types';

// Test başlangıç açıklaması
export const beckHopelessnessIntro = `
Aşağıda geleceğe dair düşüncelerimizi anlatan 20 cümle vardır. Lütfen her cümleyi dikkatlice okuyunuz. Eğer cümle sizin düşüncelerinizi yansıtıyorsa "EVET", yansıtmıyorsa "HAYIR" sütununu işaretleyiniz.
`;

// Puanlama kriterleri ve açıklamalar
export const beckHopelessnessCriteria = {
  scoring: {
    minimal: { min: 0, max: 3, description: 'Umutsuzluk yok' },
    mild: { min: 4, max: 8, description: 'Hafif düzeyde umutsuzluk' },
    moderate: { min: 9, max: 14, description: 'Orta düzeyde umutsuzluk' },
    severe: { min: 15, max: 20, description: 'İleri düzeyde umutsuzluk' }
  },
  subscales: {
    feelings: {
      name: 'Gelecek ile İlgili Duygular',
      questions: [1, 6, 13, 15, 19],
      description: 'Geleceğe yönelik duygusal tutumlar'
    },
    motivation: {
      name: 'Motivasyon Kaybı',
      questions: [2, 3, 9, 11, 12, 16, 17, 20],
      description: 'Motivasyonel değişimler ve kayıplar'
    },
    thoughts: {
      name: 'Gelecek ile İlgili Düşünceler',
      questions: [4, 7, 8, 14, 18],
      description: 'Geleceğe yönelik düşünce ve beklentiler'
    }
  },
  interpretation: [
    '0-3 puan: Umutsuzluk yok',
    '4-8 puan: Hafif düzeyde umutsuzluk',
    '9-14 puan: Orta düzeyde umutsuzluk',
    '15-20 puan: İleri düzeyde umutsuzluk'
  ],
  notes: [
    'Beck Umutsuzluk Ölçeği, geleceğe yönelik karamsarlık düzeyini ölçer',
    'Toplam 20 maddeden oluşur',
    'Her madde Evet/Hayır şeklinde yanıtlanır',
    'Bazı maddeler ters puanlanır',
    'Toplam puan 0-20 arasında değişir',
    'Üç alt faktör değerlendirilir: Gelecek ile ilgili duygular, Motivasyon kaybı, Gelecek ile ilgili düşünceler'
  ]
};

export const beckHopelessnessTest: Test = {
  id: 'beck-hopelessness',
  name: 'Beck Umutsuzluk Ölçeği',
  description: beckHopelessnessIntro,
  questions: [
    {
      id: 'BH1',
      text: 'Geleceğe umut ve coşku ile bakıyorum.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH2',
      text: 'Kendim ile ilgili şeyleri düzeltemediğime göre çabalamayı bıraksam iyi olur.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH3',
      text: 'İşler kötüye giderken bile her şeyin hep böyle kalmayacağını bilmek beni rahatlatıyor.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH4',
      text: 'Gelecek on yıl içinde hayatımın nasıl olacağını hayal bile edemiyorum.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH5',
      text: 'Yapmayı en çok istediğim şeyleri gerçekleştirmek için yeterli zamanım var.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH6',
      text: 'Benim için çok önemli konularda ileride başarılı olacağımı umuyorum.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH7',
      text: 'Geleceğimi karanlık görüyorum.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH8',
      text: 'Yaşamda, diğer insanlardan daha çok iyi şeyler elde edeceğimi umuyorum.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH9',
      text: 'İyi fırsatlar yakalayamıyorum. Gelecekte yakalayacağıma inanmam için de hiçbir neden yok.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH10',
      text: 'Geçmiş deneyimlerim beni geleceğe iyi hazırladı.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH11',
      text: 'Gelecek benim için hoş şeylerden çok tatsızlıklarla dolu görünüyor.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH12',
      text: 'Gerçekten özlediğim şeylere kavuşabileceğimi ummuyorum.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH13',
      text: 'Geleceğe baktığımda şimdikine oranla daha mutlu olacağımı umuyorum.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH14',
      text: 'İşler bir türlü benim istediğim gibi gitmiyor.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH15',
      text: 'Geleceğe büyük inancım var.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH16',
      text: 'Arzu ettiğim şeyleri elde edemediğime göre bir şeyler istemek aptallık olur.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH17',
      text: 'Gelecekte gerçek doyuma ulaşmam olanaksız gibi.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH18',
      text: 'Gelecek bana bulanık ve belirsiz görünüyor.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH19',
      text: 'Kötü günlerden çok, iyi günler bekliyorum.',
      options: [
        { value: 0, text: 'Evet' },
        { value: 1, text: 'Hayır' }
      ]
    },
    {
      id: 'BH20',
      text: 'İstediğim her şeyi elde etmek için çaba göstermenin gerçekten yararı yok, nasıl olsa onu elde edemeyeceğim.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score <= beckHopelessnessCriteria.scoring.minimal.max) 
      return beckHopelessnessCriteria.scoring.minimal.description;
    if (score <= beckHopelessnessCriteria.scoring.mild.max) 
      return beckHopelessnessCriteria.scoring.mild.description;
    if (score <= beckHopelessnessCriteria.scoring.moderate.max) 
      return beckHopelessnessCriteria.scoring.moderate.description;
    return beckHopelessnessCriteria.scoring.severe.description;
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    // Faktör puanlarını hesapla
    const factorScores = {
      feelings: beckHopelessnessCriteria.subscales.feelings.questions.reduce((sum, q) => sum + (Number(answers[`BH${q}`]) || 0), 0),
      motivation: beckHopelessnessCriteria.subscales.motivation.questions.reduce((sum, q) => sum + (Number(answers[`BH${q}`]) || 0), 0),
      thoughts: beckHopelessnessCriteria.subscales.thoughts.questions.reduce((sum, q) => sum + (Number(answers[`BH${q}`]) || 0), 0)
    };

    // Faktör ortalamalarını hesapla
    const factorAverages = {
      feelings: factorScores.feelings / beckHopelessnessCriteria.subscales.feelings.questions.length,
      motivation: factorScores.motivation / beckHopelessnessCriteria.subscales.motivation.questions.length,
      thoughts: factorScores.thoughts / beckHopelessnessCriteria.subscales.thoughts.questions.length
    };

    // Umutsuzluk düzeyini belirle
    let severityLevel = '';
    if (totalScore <= beckHopelessnessCriteria.scoring.minimal.max) {
      severityLevel = beckHopelessnessCriteria.scoring.minimal.description;
    } else if (totalScore <= beckHopelessnessCriteria.scoring.mild.max) {
      severityLevel = beckHopelessnessCriteria.scoring.mild.description;
    } else if (totalScore <= beckHopelessnessCriteria.scoring.moderate.max) {
      severityLevel = beckHopelessnessCriteria.scoring.moderate.description;
    } else {
      severityLevel = beckHopelessnessCriteria.scoring.severe.description;
    }

    // Risk faktörlerini belirle
    const riskFactors = [];
    if (factorAverages.feelings > 0.7) {
      riskFactors.push('Yüksek düzeyde gelecek umutsuzluğu');
    }
    if (factorAverages.motivation > 0.7) {
      riskFactors.push('Belirgin motivasyon kaybı');
    }
    if (factorAverages.thoughts > 0.7) {
      riskFactors.push('Olumsuz gelecek beklentileri');
    }
    if (totalScore >= 15) {
      riskFactors.push('Yüksek intihar riski - Acil müdahale gerekebilir');
    }

    // Öne çıkan belirtileri belirle
    const prominentSymptoms = Object.entries(answers)
      .filter(([_, value]) => Number(value) === 1)
      .map(([key]) => {
        const questionNumber = parseInt(key.replace('BH', ''));
        return {
          question: questionNumber,
          severity: 1,
          response: beckHopelessnessTest.questions[questionNumber - 1].text
        };
      });

    return {
      totalScore,
      severityLevel,
      factorScores,
      factorAverages,
      riskFactors,
      prominentSymptoms,
      requiresTreatment: totalScore >= 9,
      interpretation: {
        overall: `Danışanın Beck Umutsuzluk Ölçeği toplam puanı ${totalScore} olup, bu puan "${severityLevel}" düzeyine işaret etmektedir.`,
        factors: `
          Faktör analizi sonuçlarına göre:
          - Gelecek ile İlgili Duygular: ${factorAverages.feelings.toFixed(2)} (${factorScores.feelings} puan)
          - Motivasyon Kaybı: ${factorAverages.motivation.toFixed(2)} (${factorScores.motivation} puan)
          - Gelecek ile İlgili Düşünceler: ${factorAverages.thoughts.toFixed(2)} (${factorScores.thoughts} puan)
        `,
        risks: riskFactors.length > 0 
          ? `Önemli risk faktörleri: ${riskFactors.join(', ')}`
          : 'Belirgin risk faktörü saptanmamıştır.',
        symptoms: prominentSymptoms.length > 0
          ? `Öne çıkan belirtiler:\n${prominentSymptoms.map(s => `- ${s.response}`).join('\n')}`
          : 'Belirgin semptom saptanmamıştır.',
        recommendations: [
          totalScore >= 15 ? 'Acil psikiyatrik değerlendirme önerilir.' : '',
          factorAverages.feelings > 0.7 ? 'Gelecek odaklı terapi yaklaşımı faydalı olabilir.' : '',
          factorAverages.motivation > 0.7 ? 'Motivasyonel görüşme teknikleri önerilir.' : '',
          factorAverages.thoughts > 0.7 ? 'Bilişsel yeniden yapılandırma çalışması yapılabilir.' : '',
          totalScore >= 9 ? 'Düzenli takip önerilir.' : 'Periyodik kontrol önerilir.'
        ].filter(r => r !== '')
      }
    };
  }
}; 