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

// Puanlama kriterleri ve açıklamalar
export const scid5PdCriteria = {
  personalityDisorders: {
    avoidant: { name: 'Çekingen Kişilik Bozukluğu', description: 'Sosyal inhibisyon, yetersizlik duyguları ve olumsuz değerlendirilmeye karşı aşırı duyarlılık' },
    dependent: { name: 'Bağımlı Kişilik Bozukluğu', description: 'Bakım alma ihtiyacına bağlı olarak aşırı bağımlı ve boyun eğici davranışlar' },
    obsessiveCompulsive: { name: 'Obsesif-Kompulsif Kişilik Bozukluğu', description: 'Düzen, mükemmeliyetçilik ve zihinsel/kişilerarası kontrol ile aşırı uğraş' },
    paranoid: { name: 'Paranoid Kişilik Bozukluğu', description: 'Başkalarının niyetlerinden şüphelenme ve yaygın güvensizlik' },
    schizotypal: { name: 'Şizotipal Kişilik Bozukluğu', description: 'Yakın ilişkilerde rahatsızlık, bilişsel/algısal çarpıklıklar ve eksantrik davranışlar' },
    schizoid: { name: 'Şizoid Kişilik Bozukluğu', description: 'Sosyal ilişkilerden kopukluk ve kısıtlı duygusal ifade' },
    histrionic: { name: 'Histriyonik Kişilik Bozukluğu', description: 'Aşırı duygusallık ve ilgi arama davranışı' },
    narcissistic: { name: 'Narsisistik Kişilik Bozukluğu', description: 'Büyüklenmecilik, hayranlık ihtiyacı ve empati eksikliği' },
    borderline: { name: 'Sınırda Kişilik Bozukluğu', description: 'İlişkilerde, benlik algısında ve duygulanımda istikrarsızlık ve belirgin dürtüsellik' },
    antisocial: { name: 'Antisosyal Kişilik Bozukluğu', description: 'Başkalarının haklarını hiçe sayma ve ihlal etme' }
  },
  scoring: {
    '?': { value: 0, description: 'Bilgi yetersiz' },
    '1': { value: 1, description: 'Yok veya eşik altı' },
    '2': { value: 2, description: 'Eşik altı (alt klinik)' },
    '3': { value: 3, description: 'Eşik veya eşik üstü (klinik olarak anlamlı)' }
  },
  notes: [
    'SCID-5-PD, DSM-5 tanı kriterlerine göre kişilik bozukluklarını değerlendirmek için kullanılır.',
    'Test, ruh sağlığı uzmanı tarafından uygulanmalıdır.',
    'Her bölüm, ilgili kişilik bozukluğu için DSM-5 tanı kriterlerini içerir.',
    'Puanlama, her bir kriter için 1 (yok), 2 (eşik altı) veya 3 (eşik veya eşik üstü) şeklinde yapılır.',
    'Tanı, DSM-5 kriterlerine göre belirlenir.'
  ]
};

export const scid5PdTest: Test = {
  id: 'scid-5-pd',
  name: 'SCID-5-PD (DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları)',
  description: scid5PdIntro,
  infoText: 'Bu test, ruh sağlığı uzmanı tarafından uygulanmalıdır. Uzman, görüşme sırasında hastanın cevaplarına göre her bir kriteri değerlendirir ve puanlar.',
  
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

  // Puanlama fonksiyonu
  calculateScore: (answers: Record<string, number>) => {
    // SCID-5-PD'de toplam puan hesaplanmaz, tanılar DSM-5 kriterlerine göre belirlenir
    // Ancak burada kişilik bozukluğu bazında pozitif kriter sayısını hesaplayabiliriz
    return Object.values(answers).filter(value => value === 3).length;
  },

  // Puanı yorumlama fonksiyonu
  interpretScore: (score: number) => {
    return `Toplam ${score} kriter eşik veya eşik üstü (klinik olarak anlamlı) olarak değerlendirilmiştir. Tanılar DSM-5 kriterlerine göre belirlenmelidir.`;
  },

  // Rapor oluşturma fonksiyonu
  generateReport: (answers: Record<string, number>) => {
    // Kişilik bozukluğu bazında pozitif kriter sayılarını hesapla
    const pdScores: Record<string, number> = {
      avoidant: 0,
      dependent: 0,
      obsessiveCompulsive: 0,
      paranoid: 0,
      schizotypal: 0,
      schizoid: 0,
      histrionic: 0,
      narcissistic: 0,
      borderline: 0,
      antisocial: 0
    };
    
    const pdPositives: Record<string, string[]> = {
      avoidant: [],
      dependent: [],
      obsessiveCompulsive: [],
      paranoid: [],
      schizotypal: [],
      schizoid: [],
      histrionic: [],
      narcissistic: [],
      borderline: [],
      antisocial: []
    };
    
    Object.entries(answers).forEach(([key, value]) => {
      let pdType = '';
      
      if (key.startsWith('AVD')) pdType = 'avoidant';
      else if (key.startsWith('DEP')) pdType = 'dependent';
      else if (key.startsWith('OCP')) pdType = 'obsessiveCompulsive';
      else if (key.startsWith('PAR')) pdType = 'paranoid';
      else if (key.startsWith('STY')) pdType = 'schizotypal';
      else if (key.startsWith('SZD')) pdType = 'schizoid';
      else if (key.startsWith('HIS')) pdType = 'histrionic';
      else if (key.startsWith('NAR')) pdType = 'narcissistic';
      else if (key.startsWith('BOR')) pdType = 'borderline';
      else if (key.startsWith('ANT')) pdType = 'antisocial';
      
      if (pdType && value === 3) {
        pdScores[pdType]++;
        const question = scid5PdTest.questions.find(q => q.id === key);
        if (question) {
          pdPositives[pdType].push(question.text || key);
        }
      }
    });

    // Toplam pozitif kriter sayısı
    const totalPositiveCriteria = Object.values(pdScores).reduce((sum, score) => sum + score, 0);
    
    // Olası tanıları belirle (bu basitleştirilmiş bir örnektir, gerçek SCID-5-PD'de daha karmaşık tanı algoritmaları kullanılır)
    const possibleDiagnoses: string[] = [];
    
    // DSM-5'e göre her kişilik bozukluğu için gerekli minimum kriter sayısı (basitleştirilmiş)
    const requiredCriteria: Record<string, number> = {
      avoidant: 4, // 7 kriterden en az 4'ü
      dependent: 5, // 8 kriterden en az 5'i
      obsessiveCompulsive: 4, // 8 kriterden en az 4'ü
      paranoid: 4, // 7 kriterden en az 4'ü
      schizotypal: 5, // 9 kriterden en az 5'i
      schizoid: 4, // 7 kriterden en az 4'ü
      histrionic: 5, // 8 kriterden en az 5'i
      narcissistic: 5, // 9 kriterden en az 5'i
      borderline: 5, // 9 kriterden en az 5'i
      antisocial: 3 // 7 kriterden en az 3'ü
    };
    
    // Olası tanıları belirle
    Object.entries(pdScores).forEach(([pdType, score]) => {
      if (score >= requiredCriteria[pdType]) {
        const pdName = scid5PdCriteria.personalityDisorders[pdType as keyof typeof scid5PdCriteria.personalityDisorders].name;
        possibleDiagnoses.push(pdName);
      }
    });

    return {
      score: totalPositiveCriteria,
      totalScore: totalPositiveCriteria,
      severityLevel: totalPositiveCriteria > 0 ? 'Klinik değerlendirme gerekli' : 'Belirgin patoloji saptanmadı',
      requiresTreatment: totalPositiveCriteria > 0,
      factorScores: pdScores,
      factorAverages: Object.entries(pdScores).reduce((acc, [key, value]) => {
        const pdQuestionCount = Object.keys(answers).filter(q => {
          if (key === 'avoidant') return q.startsWith('AVD');
          if (key === 'dependent') return q.startsWith('DEP');
          if (key === 'obsessiveCompulsive') return q.startsWith('OCP');
          if (key === 'paranoid') return q.startsWith('PAR');
          if (key === 'schizotypal') return q.startsWith('STY');
          if (key === 'schizoid') return q.startsWith('SZD');
          if (key === 'histrionic') return q.startsWith('HIS');
          if (key === 'narcissistic') return q.startsWith('NAR');
          if (key === 'borderline') return q.startsWith('BOR');
          if (key === 'antisocial') return q.startsWith('ANT');
          return false;
        }).length;
        acc[key] = pdQuestionCount > 0 ? value / pdQuestionCount : 0;
        return acc;
      }, {} as Record<string, number>),
      riskFactors: [
        pdScores.borderline >= 3 ? 'Sınırda kişilik bozukluğu özellikleri (dürtüsellik, kendine zarar verme riski)' : '',
        pdScores.antisocial >= 3 ? 'Antisosyal kişilik bozukluğu özellikleri (saldırganlık, dürtüsellik)' : '',
        pdScores.paranoid >= 3 ? 'Paranoid kişilik bozukluğu özellikleri (aşırı şüphecilik, güvensizlik)' : ''
      ].filter(Boolean),
      prominentSymptoms: Object.entries(answers)
        .filter(([_, value]) => value === 3)
        .map(([key]) => {
          const question = scid5PdTest.questions.find(q => q.id === key);
          return {
            question: parseInt(key.substring(3)) || 0,
            severity: 3,
            response: question?.text || key
          };
        }),
      interpretation: {
        overall: `SCID-5-PD değerlendirmesinde toplam ${totalPositiveCriteria} kriter klinik olarak anlamlı düzeyde pozitif bulunmuştur.`,
        factors: Object.entries(pdScores)
          .filter(([_, score]) => score > 0)
          .map(([pdType, score]) => {
            const pdName = scid5PdCriteria.personalityDisorders[pdType as keyof typeof scid5PdCriteria.personalityDisorders].name;
            const requiredScore = requiredCriteria[pdType];
            return `${pdName}: ${score} pozitif kriter (tanı için gereken: ${requiredScore})`;
          })
          .join('\n'),
        risks: possibleDiagnoses.length > 0 
          ? `Olası tanılar: ${possibleDiagnoses.join(', ')}`
          : 'Belirgin kişilik bozukluğu tanı kriteri karşılanmamaktadır.',
        symptoms: Object.entries(pdPositives)
          .filter(([_, symptoms]) => symptoms.length > 0)
          .map(([pdType, symptoms]) => {
            const pdName = scid5PdCriteria.personalityDisorders[pdType as keyof typeof scid5PdCriteria.personalityDisorders].name;
            return `${pdName}:\n${symptoms.map(s => `- ${s}`).join('\n')}`;
          })
          .join('\n\n'),
        recommendations: [
          totalPositiveCriteria > 0 ? 'Kapsamlı klinik değerlendirme önerilir.' : 'Rutin takip önerilir.',
          possibleDiagnoses.length > 0 ? 'DSM-5 kriterlerine göre kişilik bozukluğu tanı değerlendirmesi yapılmalıdır.' : '',
          pdScores.borderline >= 3 ? 'Sınırda kişilik bozukluğu özellikleri için detaylı değerlendirme ve tedavi planı gereklidir.' : '',
          pdScores.antisocial >= 3 ? 'Antisosyal kişilik bozukluğu özellikleri için detaylı değerlendirme gereklidir.' : ''
        ].filter(Boolean)
      }
    };
  }
}; 