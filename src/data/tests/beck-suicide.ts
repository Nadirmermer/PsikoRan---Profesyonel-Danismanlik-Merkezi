import { Test } from './types';

// Test başlangıç açıklaması
export const beckSuicideIntro = `
Aşağıda, kişilerin intiharla ilgili düşünce ve davranışlarını ifade eden bazı cümleler verilmiştir. 
Lütfen her ifadeyi dikkatle okuyunuz ve size en uygun olan seçeneği işaretleyiniz.
`;

// Puanlama kriterleri ve açıklamalar
export const beckSuicideCriteria = {
  sections: {
    attitudeTowardsLifeAndDeath: {
      questions: [1, 2, 3, 4, 5],
      description: 'Yaşam ve Ölüme Dair Tutumun Özellikleri',
    },
    suicidalThoughtsAndDesires: {
      questions: [6, 7, 8, 9, 10, 11],
      description: 'İntihar Düşüncesi ve Arzusunun Özellikleri',
    },
    plannedAttemptCharacteristics: {
      questions: [12, 13, 14, 15],
      description: 'Tasarlanan Girişimin Özellikleri',
    },
    plannedAttemptExecution: {
      questions: [16, 17, 18, 19],
      description: 'Tasarlanan Girişimin Gerçekleştirilmesi',
    },
  },
  scoring: {
    min: 0,
    max: 38,
    levels: {
      minimal: { min: 0, max: 5, description: 'Düşük risk' },
      mild: { min: 6, max: 19, description: 'Orta risk' },
      severe: { min: 20, max: 38, description: 'Yüksek risk - Acil müdahale gerekli' }
    },
    description: 'Puanın yüksek olması intihar düşüncesinin belirgin ve ciddi olması anlamına gelmektedir.'
  },
  interpretation: [
    '0-5 puan: Düşük risk',
    '6-19 puan: Orta risk',
    '20-38 puan: Yüksek risk - Acil müdahale gerekli'
  ],
  notes: [
    'Beck İntihar Düşüncesi Ölçeği, intihar riskini değerlendiren 19 maddelik bir ölçektir',
    'Her madde 0-2 arası puanlanır',
    'Toplam puan 0-38 arasında değişir',
    'Ölçekten toplam alınan puan tüm maddelerden alınan puanların aritmetik toplamı ile elde edilir',
    'Arka plan faktörleri genel değerlendirmeye alınmamaktadır',
    'Puanın yüksek olması intihar düşüncesinin belirgin ve ciddi olması anlamına gelmektedir'
  ]
};

export const beckSuicideTest: Test = {
  id: 'beck-suicide',
  name: 'Beck İntihar Düşüncesi Ölçeği',
  description: beckSuicideIntro,
  questions: [
    {
      id: 'BS1',
      text: 'Yaşama arzusu',
      options: [
        { value: 0, text: 'Orta veya şiddetli' },
        { value: 1, text: 'Zayıf' },
        { value: 2, text: 'Yok' }
      ]
    },
    {
      id: 'BS2',
      text: 'Ölme arzusu',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Zayıf' },
        { value: 2, text: 'Orta veya şiddetli' }
      ]
    },
    {
      id: 'BS3',
      text: 'Yaşam / Ölüm için nedenler',
      options: [
        { value: 0, text: 'Yaşam ölümden ağır basıyor' },
        { value: 1, text: 'Yaşam ve ölüm için nedenler eşit' },
        { value: 2, text: 'Ölmek yaşamaktan ağır basıyor' }
      ]
    },
    {
      id: 'BS4',
      text: 'Aktif intihar girişiminde bulunma arzusu',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Zayıf' },
        { value: 2, text: 'Orta veya şiddetli' }
      ]
    },
    {
      id: 'BS5',
      text: 'Pasif intihar girişimi',
      options: [
        { value: 0, text: 'Yaşamını kurtarmak için gerekli önlemleri alıyor' },
        { value: 1, text: 'Yaşamayı ölmeyi şansa bırakıyor' },
        { value: 2, text: 'Hayatını korumaktan ve sürdürmekten kaçıyor' }
      ]
    },
    {
      id: 'BS6',
      text: 'İntihar düşüncesinin/isteğinin süresi',
      options: [
        { value: 0, text: 'Kısa ve geçici dönemler' },
        { value: 1, text: 'Uzun dönemler' },
        { value: 2, text: 'Kesintisiz veya neredeyse sürekli' }
      ]
    },
    {
      id: 'BS7',
      text: 'İntihar düşüncesinin sıklığı',
      options: [
        { value: 0, text: 'Nadiren' },
        { value: 1, text: 'Aralıklı' },
        { value: 2, text: 'Kalıcı ya da sürekli' }
      ]
    },
    {
      id: 'BS8',
      text: 'Düşünce ve isteğe karşı tutum',
      options: [
        { value: 0, text: 'Kabul etmeyen' },
        { value: 1, text: 'Kararsız, ilgisiz' },
        { value: 2, text: 'Kabul eden' }
      ]
    },
    {
      id: 'BS9',
      text: 'İntihar eylemi ve eylem isteği üzerinde kontrol',
      options: [
        { value: 0, text: 'Kontrol duygusu var' },
        { value: 1, text: 'Kontrolden emin değil' },
        { value: 2, text: 'Kontrol duygusu yok' }
      ]
    },
    {
      id: 'BS10',
      text: 'Aktif girişimden caydırıcılar (örnek; aile, din, geri dönüşsüzlük)',
      options: [
        { value: 0, text: 'Caydırıcı nedeniyle girişimde bulunmama' },
        { value: 1, text: 'Caydırıcılar hakkında biraz endişe' },
        { value: 2, text: 'Caydırıcılar hakkında hiç ya da çok az endişe' }
      ]
    },
    {
      id: 'BS11',
      text: 'Düşünülen girişim için neden',
      options: [
        { value: 0, text: 'Çevreyi etkilemek, dikkat çekmek ve ya intikam' },
        { value: 1, text: 'Kaçma ve etkileme isteğinin birleşimi' },
        { value: 2, text: 'Problem çözmeyi bitirmek için kaçma' }
      ]
    },
    {
      id: 'BS12',
      text: 'Yöntem: Düşünülen girişimin özgüllük ve planlaması',
      options: [
        { value: 0, text: 'Üzerinde düşünülmemiş' },
        { value: 1, text: 'Düşünülmüş ama detaylar çalışılmamış' },
        { value: 2, text: 'Detaylar çalışılmış ve çok iyi planlanmış' }
      ]
    },
    {
      id: 'BS13',
      text: 'Yöntem: Düşünülen girişim için uygunluk ve fırsat',
      options: [
        { value: 0, text: 'Yönteme ulaşılamıyor ve ya fırsat yok' },
        { value: 1, text: 'Yöntem zaman ve çaba istiyor, fırsat hazır değil' },
        { value: 2, text: 'Yöntem ve fırsat erişilebilir' }
      ]
    },
    {
      id: 'BS14',
      text: 'Girişimi gerçekleştirmek için "kapasite" hissi',
      options: [
        { value: 0, text: 'Cesaret yok, çok zayıf, yetersiz' },
        { value: 1, text: 'Cesaret ve yeterlilikten emin değil' },
        { value: 2, text: 'Cesaret ve yeterlilikten emin' }
      ]
    },
    {
      id: 'BS15',
      text: 'Güncel girişim beklentisi/ öngörüsü',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Emin değil, belirsiz' },
        { value: 2, text: 'Evet' }
      ]
    },
    {
      id: 'BS16',
      text: 'Düşünülen girişim için güncel hazırlık',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Kısmen' },
        { value: 2, text: 'Tam' }
      ]
    },
    {
      id: 'BS17',
      text: 'İntihar Notu',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Başlamış ama tamamlamamış, sadece düşünce' },
        { value: 2, text: 'Tamamlamış' }
      ]
    },
    {
      id: 'BS18',
      text: 'Ölüm beklentisi içinde yapılan son eylemler',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Düşünmüş ve bazı düzenlemeler yapmış' },
        { value: 2, text: 'Kesin planlar ya da düzenlemeler yapmış' }
      ]
    },
    {
      id: 'BS19',
      text: 'Tasarlanan girişimin gizlenmesi ya da aldatıcı bir tavır sergilenmesi',
      options: [
        { value: 0, text: 'Tasarıları açıkça belli' },
        { value: 1, text: 'Açıklamayı erteliyor' },
        { value: 2, text: 'Yalan söylemeye, aldatmaya, gizli tutmaya çalışma' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score <= beckSuicideCriteria.scoring.levels.minimal.max) 
      return beckSuicideCriteria.scoring.levels.minimal.description;
    if (score <= beckSuicideCriteria.scoring.levels.mild.max) 
      return beckSuicideCriteria.scoring.levels.mild.description;
    return beckSuicideCriteria.scoring.levels.severe.description;
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    // Bölüm puanlarını hesapla
    const sectionScores = {
      attitudeTowardsLifeAndDeath: beckSuicideCriteria.sections.attitudeTowardsLifeAndDeath.questions
        .reduce((sum, q) => sum + (Number(answers[`BS${q}`]) || 0), 0),
      suicidalThoughtsAndDesires: beckSuicideCriteria.sections.suicidalThoughtsAndDesires.questions
        .reduce((sum, q) => sum + (Number(answers[`BS${q}`]) || 0), 0),
      plannedAttemptCharacteristics: beckSuicideCriteria.sections.plannedAttemptCharacteristics.questions
        .reduce((sum, q) => sum + (Number(answers[`BS${q}`]) || 0), 0),
      plannedAttemptExecution: beckSuicideCriteria.sections.plannedAttemptExecution.questions
        .reduce((sum, q) => sum + (Number(answers[`BS${q}`]) || 0), 0)
    };

    // Bölüm ortalamalarını hesapla
    const sectionAverages = {
      attitudeTowardsLifeAndDeath: sectionScores.attitudeTowardsLifeAndDeath / 
        beckSuicideCriteria.sections.attitudeTowardsLifeAndDeath.questions.length,
      suicidalThoughtsAndDesires: sectionScores.suicidalThoughtsAndDesires / 
        beckSuicideCriteria.sections.suicidalThoughtsAndDesires.questions.length,
      plannedAttemptCharacteristics: sectionScores.plannedAttemptCharacteristics / 
        beckSuicideCriteria.sections.plannedAttemptCharacteristics.questions.length,
      plannedAttemptExecution: sectionScores.plannedAttemptExecution / 
        beckSuicideCriteria.sections.plannedAttemptExecution.questions.length
    };

    // Risk düzeyini belirle
    let severityLevel = '';
    if (totalScore <= beckSuicideCriteria.scoring.levels.minimal.max) {
      severityLevel = beckSuicideCriteria.scoring.levels.minimal.description;
    } else if (totalScore <= beckSuicideCriteria.scoring.levels.mild.max) {
      severityLevel = beckSuicideCriteria.scoring.levels.mild.description;
    } else {
      severityLevel = beckSuicideCriteria.scoring.levels.severe.description;
    }

    // Risk faktörlerini belirle
    const riskFactors = [];
    if (sectionAverages.attitudeTowardsLifeAndDeath > 1) {
      riskFactors.push('Yaşam ve ölüme dair olumsuz tutum');
    }
    if (sectionAverages.suicidalThoughtsAndDesires > 1) {
      riskFactors.push('Yoğun intihar düşünceleri ve arzusu');
    }
    if (sectionAverages.plannedAttemptCharacteristics > 1) {
      riskFactors.push('Detaylı intihar planı mevcut');
    }
    if (sectionAverages.plannedAttemptExecution > 1) {
      riskFactors.push('İntihar girişimi hazırlığı var');
    }
    if (totalScore >= 20) {
      riskFactors.push('Çok yüksek risk - Acil müdahale gerekli');
    }

    // Öne çıkan belirtileri belirle
    const prominentSymptoms = Object.entries(answers)
      .filter(([_, value]) => Number(value) === 2)
      .map(([key]) => {
        const questionNumber = parseInt(key.replace('BS', ''));
        return {
          question: questionNumber,
          severity: 2,
          response: beckSuicideTest.questions[questionNumber - 1].text
        };
      });

    return {
      totalScore,
      severityLevel,
      factorScores: sectionScores,
      factorAverages: sectionAverages,
      riskFactors,
      prominentSymptoms,
      requiresTreatment: totalScore >= 6,
      interpretation: {
        overall: `Danışanın Beck İntihar Düşüncesi Ölçeği toplam puanı ${totalScore} olup, bu puan "${severityLevel}" düzeyine işaret etmektedir.`,
        factors: `
          Bölüm analizi sonuçlarına göre:
          - Yaşam ve Ölüme Dair Tutum: ${sectionAverages.attitudeTowardsLifeAndDeath.toFixed(2)} (${sectionScores.attitudeTowardsLifeAndDeath} puan)
          - İntihar Düşüncesi ve Arzusu: ${sectionAverages.suicidalThoughtsAndDesires.toFixed(2)} (${sectionScores.suicidalThoughtsAndDesires} puan)
          - Tasarlanan Girişimin Özellikleri: ${sectionAverages.plannedAttemptCharacteristics.toFixed(2)} (${sectionScores.plannedAttemptCharacteristics} puan)
          - Tasarlanan Girişimin Gerçekleştirilmesi: ${sectionAverages.plannedAttemptExecution.toFixed(2)} (${sectionScores.plannedAttemptExecution} puan)
        `,
        risks: riskFactors.length > 0 
          ? `Önemli risk faktörleri: ${riskFactors.join(', ')}`
          : 'Belirgin risk faktörü saptanmamıştır.',
        symptoms: prominentSymptoms.length > 0
          ? `Öne çıkan belirtiler:\n${prominentSymptoms.map(s => `- ${s.response}`).join('\n')}`
          : 'Belirgin semptom saptanmamıştır.',
        recommendations: [
          totalScore >= 20 ? 'ACİL PSİKİYATRİK DEĞERLENDİRME GEREKLİDİR!' : '',
          sectionAverages.attitudeTowardsLifeAndDeath > 1 ? 'Yaşam ve ölüme dair tutum için acil müdahale gerekli.' : '',
          sectionAverages.suicidalThoughtsAndDesires > 1 ? 'İntihar düşünceleri için yakın takip gerekli.' : '',
          sectionAverages.plannedAttemptCharacteristics > 1 ? 'İntihar planı için güvenlik önlemleri alınmalı.' : '',
          sectionAverages.plannedAttemptExecution > 1 ? 'İntihar girişimi hazırlığı için acil önlem alınmalı.' : '',
          totalScore >= 6 ? 'Düzenli psikiyatrik takip gerekli.' : 'Periyodik kontrol önerilir.'
        ].filter(r => r !== '')
      }
    };
  }
}; 