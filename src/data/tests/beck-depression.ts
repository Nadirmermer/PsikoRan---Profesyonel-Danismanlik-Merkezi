import { Test } from './types';

// Test başlangıç açıklaması
export const beckDepressionIntro = `
Aşağıda, kişilerin ruh durumlarını ifade ederken kullandıkları bazı cümleler verilmiştir.
Her madde bir çeşit ruh durumunu anlatmaktadır. Her maddede o durumun derecesini belirleyen
4 seçenek vardır. Lütfen bu seçenekleri dikkatle okuyunuz. Son bir hafta içindeki (şu an dahil)
kendi ruh durumunuzu göz önünde bulundurarak, size en uygun olan ifadeyi seçiniz.
`;

// Puanlama kriterleri ve açıklamalar
export const beckDepressionCriteria = {
  scoring: {
    normal: { min: 5, max: 9, description: 'Normal düzey' },
    mild: { min: 10, max: 18, description: 'Hafif-orta düzey depresyon' },
    moderate: { min: 19, max: 29, description: 'Orta-şiddetli düzey depresyon' },
    severe: { min: 30, max: 63, description: 'Şiddetli düzey depresyon' }
  },
  cutoffScore: 17,
  factors: {
    hopelessness: {
      name: 'Umutsuzluk',
      description: 'Kişinin umutsuzluğunu ölçer',
      questions: [1, 2, 4, 9, 11, 12, 13, 15, 17]
    },
    negativeSelf: {
      name: 'Kendine Yönelik Olumsuz Duygular',
      description: 'Kişinin kendine yönelik olumsuz duygularını ölçer',
      questions: [3, 7]
    },
    somaticConcerns: {
      name: 'Bedensel Kaygılar',
      description: 'Kişinin bedensel kaygılarını ölçer',
      questions: [14, 20]
    },
    guilt: {
      name: 'Suçluluk Duyguları',
      description: 'Kişinin suçluluk duygularını ölçer',
      questions: [5, 6, 8, 13]
    }
  },
  interpretation: [
    '5-9 puan: Normal düzey',
    '10-18 puan: Hafif-orta düzey depresyon',
    '19-29 puan: Orta-şiddetli düzey depresyon',
    '30-63 puan: Şiddetli düzey depresyon',
    '17 ve üzeri: Tedavi gerektiren depresyon düzeyi'
  ],
  notes: [
    'Beck Depresyon Envanteri, depresyon belirtilerinin şiddetini ölçmek için kullanılır.',
    'Her madde 0-3 arası puanlanır.',
    'Toplam puan 0-63 arasında değişir.',
    'Kesme puanı 17\'dir. 17 ve üstü puanlar tedavi gerektirir.',
    'Dört ana faktör üzerinden değerlendirme yapılır: Umutsuzluk, Kendine Yönelik Olumsuz Duygular, Bedensel Kaygılar ve Suçluluk Duyguları.'
  ]
};

export const beckDepressionTest: Test = {
  id: 'beck-depression',
  name: 'Beck Depresyon Ölçeği',
  description: beckDepressionIntro,
  questions: [
    {
      id: 'BD1',
      options: [
        { value: 0, text: 'Kendimi üzüntülü ve sıkıntılı hissetmiyorum' },
        { value: 1, text: 'Kendimi üzüntülü ve sıkıntılı hissediyorum' },
        { value: 2, text: 'Hep üzüntülü ve sıkıntılıyım. Bundan kurtulamıyorum' },
        { value: 3, text: 'O kadar üzüntülü ve sıkıntılıyım ki artık dayanamıyorum' }
      ]
    },
    {
      id: 'BD2',
      options: [
        { value: 0, text: 'Gelecek hakkında umutsuz ve karamsar değilim' },
        { value: 1, text: 'Gelecek hakkında karamsarım' },
        { value: 2, text: 'Gelecekten beklediğim hiçbir şey yok' },
        { value: 3, text: 'Geleceğim hakkında umutsuzum ve sanki hiçbir şey düzelmeyecekmiş gibi geliyor' }
      ]
    },
    {
      id: 'BD3',
      options: [
        { value: 0, text: 'Kendimi başarısız bir insan olarak görmüyorum' },
        { value: 1, text: 'Çevremdeki birçok kişiden daha çok başarısızlıklarım olmuş gibi hissediyorum' },
        { value: 2, text: 'Geçmişe baktığımda başarısızlıklarla dolu olduğunu görüyorum' },
        { value: 3, text: 'Kendimi tümüyle başarısız biri olarak görüyorum' }
      ]
    },
    {
      id: 'BD4',
      options: [
        { value: 0, text: 'Birçok şeyden eskisi kadar zevk alıyorum' },
        { value: 1, text: 'Eskiden olduğu gibi her şeyden hoşlanmıyorum' },
        { value: 2, text: 'Artık hiçbir şey bana tam anlamıyla zevk vermiyor' },
        { value: 3, text: 'Her şeyden sıkılıyorum' }
      ]
    },
    {
      id: 'BD5',
      options: [
        { value: 0, text: 'Kendimi herhangi bir şekilde suçlu hissetmiyorum' },
        { value: 1, text: 'Kendimi zaman zaman suçlu hissediyorum' },
        { value: 2, text: 'Çoğu zaman kendimi suçlu hissediyorum' },
        { value: 3, text: 'Kendimi her zaman suçlu hissediyorum' }
      ]
    },
    {
      id: 'BD6',
      options: [
        { value: 0, text: 'Bana cezalandırılmışım gibi gelmiyor' },
        { value: 1, text: 'Cezalandırılabileceğimi hissediyorum' },
        { value: 2, text: 'Cezalandırılmayı bekliyorum' },
        { value: 3, text: 'Cezalandırıldığımı hissediyorum' }
      ]
    },
    {
      id: 'BD7',
      options: [
        { value: 0, text: 'Kendimden memnunum' },
        { value: 1, text: 'Kendi kendimden pek memnun değilim' },
        { value: 2, text: 'Kendime çok kızıyorum' },
        { value: 3, text: 'Kendimden nefret ediyorum' }
      ]
    },
    {
      id: 'BD8',
      options: [
        { value: 0, text: 'Başkalarından daha kötü olduğumu sanmıyorum' },
        { value: 1, text: 'Zayıf yanlarım veya hatalarım için kendi kendimi eleştiririm' },
        { value: 2, text: 'Hatalarımdan dolayı ve her zaman kendimi kabahatli bulurum' },
        { value: 3, text: 'Her aksilik karşısında kendimi hatalı bulurum' }
      ]
    },
    {
      id: 'BD9',
      options: [
        { value: 0, text: 'Kendimi öldürmek gibi düşüncelerim yok' },
        { value: 1, text: 'Zaman zaman kendimi öldürmeyi düşündüğüm olur. Fakat yapmıyorum' },
        { value: 2, text: 'Kendimi öldürmek isterdim' },
        { value: 3, text: 'Fırsatını bulsam kendimi öldürürdüm' }
      ]
    },
    {
      id: 'BD10',
      options: [
        { value: 0, text: 'Her zamankinden fazla içimden ağlamak gelmiyor' },
        { value: 1, text: 'Zaman zaman içimdem ağlamak geliyor' },
        { value: 2, text: 'Çoğu zaman ağlıyorum' },
        { value: 3, text: 'Eskiden ağlayabilirdim şimdi istesem de ağlayamıyorum' }
      ]
    },
    {
      id: 'BD11',
      options: [
        { value: 0, text: 'Şimdi her zaman olduğumdan daha sinirli değilim' },
        { value: 1, text: 'Eskisine kıyasla daha kolay kızıyor ya da sinirleniyorum' },
        { value: 2, text: 'Şimdi hep sinirliyim' },
        { value: 3, text: 'Bir zamanlar beni sinirlendiren şeyler şimdi hiç sinirlendirmiyor' }
      ]
    },
    {
      id: 'BD12',
      options: [
        { value: 0, text: 'Başkaları ile görüşmek, konuşmak isteğimi kaybetmedim' },
        { value: 1, text: 'Başkaları ile eskiden daha az konuşmak, görüşmek istiyorum' },
        { value: 2, text: 'Başkaları ile konuşma ve görüşme isteğimin çoğunu kaybettim' },
        { value: 3, text: 'Hiç kimseyle konuşmak görüşmek istemiyorum' }
      ]
    },
    {
      id: 'BD13',
      options: [
        { value: 0, text: 'Eskiden olduğu gibi kolay karar verebiliyorum' },
        { value: 1, text: 'Eskiden olduğu kadar kolay karar veremiyorum' },
        { value: 2, text: 'Karar verirken eskisine kıyasla çok güçlük çekiyorum' },
        { value: 3, text: 'Artık hiç karar veremiyorum' }
      ]
    },
    {
      id: 'BD14',
      options: [
        { value: 0, text: 'Aynada kendime baktığımda değişiklik görmüyorum' },
        { value: 1, text: 'Daha yaşlanmış ve çirkinleşmişim gibi geliyor' },
        { value: 2, text: 'Görünüşümün çok değiştiğini ve çirkinleştiğimi hissediyorum' },
        { value: 3, text: 'Kendimi çok çirkin buluyorum' }
      ]
    },
    {
      id: 'BD15',
      options: [
        { value: 0, text: 'Eskisi kadar iyi çalışabiliyorum' },
        { value: 1, text: 'Bir şeyler yapabilmek için gayret göstermem gerekiyor' },
        { value: 2, text: 'Herhangi bir şeyi yapabilmek için kendimi çok zorlamam gerekiyor' },
        { value: 3, text: 'Hiçbir şey yapamıyorum' }
      ]
    },
    {
      id: 'BD16',
      options: [
        { value: 0, text: 'Her zamanki gibi iyi uyuyabiliyorum' },
        { value: 1, text: 'Eskiden olduğu gibi iyi uyuyamıyorum' },
        { value: 2, text: 'Her zamankinden 1-2 saat daha erken uyanıyorum ve tekrar uyuyamıyorum' },
        { value: 3, text: 'Her zamankinden çok daha erken uyanıyor ve tekrar uyuyamıyorum' }
      ]
    },
    {
      id: 'BD17',
      options: [
        { value: 0, text: 'Her zamankinden daha çabuk yorulmuyorum' },
        { value: 1, text: 'Her zamankinden daha çabuk yoruluyorum' },
        { value: 2, text: 'Yaptığım her şey beni yoruyor' },
        { value: 3, text: 'Kendimi hemen hiçbir şey yapamayacak kadar yorgun hissediyorum' }
      ]
    },
    {
      id: 'BD18',
      options: [
        { value: 0, text: 'İştahım her zamanki gibi' },
        { value: 1, text: 'İştahım her zamanki kadar iyi değil' },
        { value: 2, text: 'İştahım çok azaldı' },
        { value: 3, text: 'Artık hiç iştahım yok' }
      ]
    },
    {
      id: 'BD19',
      options: [
        { value: 0, text: 'Son zamanlarda kilo vermedim' },
        { value: 1, text: 'İki kilodan fazla kilo verdim' },
        { value: 2, text: 'Dört kilodan fazla kilo verdim' },
        { value: 3, text: 'Altı kilodan fazla kilo vermeye çalışıyorum' }
      ]
    },
    {
      id: 'BD20',
      options: [
        { value: 0, text: 'Sağlığım beni fazla endişelendirmiyor' },
        { value: 1, text: 'Ağrı, sancı, mide bozukluğu veya kabızlık gibi rahatsızlıklar beni endişelendiriyor' },
        { value: 2, text: 'Sağlığım beni endişelendirdiği için başka şeyleri düşünmek zorlaşıyor' },
        { value: 3, text: 'Sağlığım hakkında o kadar endişeliyim ki başka hiçbir şey düşünemiyorum' }
      ]
    },
    {
      id: 'BD21',
      options: [
        { value: 0, text: 'Son zamanlarda cinsel konulara olan ilgimde bir değişme fark etmedim' },
        { value: 1, text: 'Cinsel konularla eskisinden daha az ilgiliyim' },
        { value: 2, text: 'Cinsel konularla şimdi çok daha az ilgiliyim' },
        { value: 3, text: 'Cinsel konular olan ilgimi tamamen kaybettim' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score < 5) return 'Geçersiz skor';
    if (score <= beckDepressionCriteria.scoring.normal.max) return beckDepressionCriteria.scoring.normal.description;
    if (score <= beckDepressionCriteria.scoring.mild.max) return beckDepressionCriteria.scoring.mild.description;
    if (score <= beckDepressionCriteria.scoring.moderate.max) return beckDepressionCriteria.scoring.moderate.description;
    if (score <= beckDepressionCriteria.scoring.severe.max) return beckDepressionCriteria.scoring.severe.description;
    return 'Geçersiz skor';
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    // Faktör puanlarını hesapla
    const factorScores = {
      hopelessness: beckDepressionCriteria.factors.hopelessness.questions.reduce((sum, q) => sum + (Number(answers[`BD${q}`]) || 0), 0),
      negativeSelf: beckDepressionCriteria.factors.negativeSelf.questions.reduce((sum, q) => sum + (Number(answers[`BD${q}`]) || 0), 0),
      somaticConcerns: beckDepressionCriteria.factors.somaticConcerns.questions.reduce((sum, q) => sum + (Number(answers[`BD${q}`]) || 0), 0),
      guilt: beckDepressionCriteria.factors.guilt.questions.reduce((sum, q) => sum + (Number(answers[`BD${q}`]) || 0), 0)
    };

    // Faktör ortalamalarını hesapla
    const factorAverages = {
      hopelessness: factorScores.hopelessness / beckDepressionCriteria.factors.hopelessness.questions.length,
      negativeSelf: factorScores.negativeSelf / beckDepressionCriteria.factors.negativeSelf.questions.length,
      somaticConcerns: factorScores.somaticConcerns / beckDepressionCriteria.factors.somaticConcerns.questions.length,
      guilt: factorScores.guilt / beckDepressionCriteria.factors.guilt.questions.length
    };

    // Depresyon düzeyini belirle
    let severityLevel = '';
    let requiresTreatment = false;
    if (totalScore <= beckDepressionCriteria.scoring.normal.max) {
      severityLevel = beckDepressionCriteria.scoring.normal.description;
    } else if (totalScore <= beckDepressionCriteria.scoring.mild.max) {
      severityLevel = beckDepressionCriteria.scoring.mild.description;
    } else if (totalScore <= beckDepressionCriteria.scoring.moderate.max) {
      severityLevel = beckDepressionCriteria.scoring.moderate.description;
    } else if (totalScore <= beckDepressionCriteria.scoring.severe.max) {
      severityLevel = beckDepressionCriteria.scoring.severe.description;
    }

    // Tedavi gereksinimi kontrolü
    if (totalScore >= beckDepressionCriteria.cutoffScore) {
      requiresTreatment = true;
    }

    // Risk faktörlerini belirle
    const riskFactors = [];
    if (Number(answers.BD9) >= 2) {
      riskFactors.push('Yüksek intihar riski');
    }
    if (factorAverages.hopelessness > 2) {
      riskFactors.push('Yüksek umutsuzluk düzeyi');
    }
    if (factorAverages.negativeSelf > 2) {
      riskFactors.push('Belirgin olumsuz benlik algısı');
    }

    // Öne çıkan belirtileri belirle
    const prominentSymptoms = Object.entries(answers)
      .filter(([_, value]) => Number(value) >= 2)
      .map(([key]) => {
        const questionNumber = parseInt(key.replace('BD', ''));
        return {
          question: questionNumber,
          severity: Number(answers[key]),
          response: beckDepressionTest.questions[questionNumber - 1].options.find(opt => opt.value === Number(answers[key]))?.text
        };
      });

    return {
      totalScore,
      severityLevel,
      requiresTreatment,
      factorScores,
      factorAverages,
      riskFactors,
      prominentSymptoms,
      interpretation: {
        overall: `Danışanın Beck Depresyon Ölçeği toplam puanı ${totalScore} olup, bu puan "${severityLevel}" düzeyine işaret etmektedir.${
          requiresTreatment ? ' Bu düzey klinik olarak anlamlı olup tedavi gerektirir.' : ''
        }`,
        factors: `
          Faktör analizi sonuçlarına göre:
          - Umutsuzluk: ${factorAverages.hopelessness.toFixed(2)} (${factorScores.hopelessness} puan)
          - Olumsuz Benlik: ${factorAverages.negativeSelf.toFixed(2)} (${factorScores.negativeSelf} puan)
          - Bedensel Belirtiler: ${factorAverages.somaticConcerns.toFixed(2)} (${factorScores.somaticConcerns} puan)
          - Suçluluk Duyguları: ${factorAverages.guilt.toFixed(2)} (${factorScores.guilt} puan)
        `,
        risks: riskFactors.length > 0 
          ? `Önemli risk faktörleri: ${riskFactors.join(', ')}`
          : 'Belirgin risk faktörü saptanmamıştır.',
        symptoms: prominentSymptoms.length > 0
          ? `Öne çıkan belirtiler:\n${prominentSymptoms.map(s => `- ${s.response}`).join('\n')}`
          : 'Belirgin semptom saptanmamıştır.',
        recommendations: [
          requiresTreatment ? 'Klinik değerlendirme ve tedavi önerilir.' : 'Takip önerilir.',
          factorAverages.hopelessness > 2 ? 'Umutsuzluk düzeyi için özel müdahale gerekebilir.' : '',
          Number(answers.BD9) >= 2 ? 'İntihar riski için acil değerlendirme gereklidir.' : '',
          factorAverages.somaticConcerns > 2 ? 'Bedensel belirtiler için tıbbi değerlendirme önerilebilir.' : ''
        ].filter(r => r !== '')
      }
    };
  }
}; 