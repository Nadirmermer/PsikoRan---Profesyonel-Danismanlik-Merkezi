import { Test } from './types';

// Test başlangıç açıklaması
export const childSocialAnxietyIntro = `
Aşağıda bazı cümleler ve yanlarında da bazı seçenekler verilmiştir. Her cümleyi okuduktan sonra, son bir ayı düşünerek bu cümle için size en uygun gelen seçeneği işaretleyin. Cümlenin size uygunluğuna göre o cümleye 0-4 arasında bir puan verin.
`;

// Puanlama kriterleri ve açıklamalar
export const socialAnxietyCriteria = {
  scoring: {
    minimal: { min: 0, max: 24, description: 'Minimal düzeyde sosyal anksiyete' },
    mild: { min: 25, max: 49, description: 'Hafif düzeyde sosyal anksiyete' },
    moderate: { min: 50, max: 74, description: 'Orta düzeyde sosyal anksiyete' },
    severe: { min: 75, max: 100, description: 'Şiddetli düzeyde sosyal anksiyete' }
  },
  interpretation: [
    'Toplam puan 0-24 arası: Minimal düzeyde sosyal anksiyete',
    'Toplam puan 25-49 arası: Hafif düzeyde sosyal anksiyete',
    'Toplam puan 50-74 arası: Orta düzeyde sosyal anksiyete',
    'Toplam puan 75-100 arası: Şiddetli düzeyde sosyal anksiyete'
  ],
  notes: [
    'Çocuklar İçin Sosyal Anksiyete Ölçeği (Yenilenmiş Biçim), çocuklarda sosyal anksiyete düzeyini ölçmek için kullanılır.',
    'Her madde 0-4 arası puanlanır.',
    'Toplam puan 0-100 arasında değişir.'
  ]
};

export const childSocialAnxietyTest: Test = {
  id: 'child-social-anxiety',
  name: 'Çocuklar İçin Sosyal Anksiyete Ölçeği',
  description: childSocialAnxietyIntro,
  questions: [
    {
      id: 'SA1',
      text: 'Başka çocukların önünde yeni bir şey yapmaktan rahatsız olurum.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA2',
      text: 'Bana şaka yapılmasından rahatsız olurum.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA3',
      text: 'Tanımadığım çocukların yanında utanırım.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA4',
      text: 'Diğer çocuklar arkamdan konuşuyorlar diye düşünürüm.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA5',
      text: 'Yalnızca iyi tanıdığım çocuklarla konuşurum.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA6',
      text: 'Diğer çocuklar benim hakkımda ne düşünüyorlar diye endişelenirim.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA7',
      text: 'Diğer çocukların benden hoşlanmayacağından korkarım.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA8',
      text: 'İyi tanımadığım çocuklarla konuşurken rahatsız olurum.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA9',
      text: 'Diğer çocuklar benim hakkımda ne diyecekler diye endişelenirim.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA10',
      text: 'Yeni tanıştığım çocuklarla konuşurken rahatsız olurum.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA11',
      text: 'Diğer çocuklar benden hoşlanmıyorlar diye üzülürüm.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA12',
      text: 'Bir grup çocukla birlikteyken sessiz kalırım.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA13',
      text: 'Diğer çocuklar benimle alay ediyorlar diye düşünürüm.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA14',
      text: 'Başka bir çocukla tartışırsam, onun benden hoşlanmayacağından korkarım.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA15',
      text: 'Başkalarını evime çağırmaktan çekinirim, çünkü hayır diyebilirler.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA16',
      text: 'Bazı çocukların yanındayken rahatsız olurum.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA17',
      text: 'İyi tanıdığım çocukların yanındayken bile utanırım.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    },
    {
      id: 'SA18',
      text: 'Başka çocuklarla birlikte oynamayı teklif etmek bana zor gelir.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Çok az' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Çoğu zaman' },
        { value: 4, text: 'Daima' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score <= socialAnxietyCriteria.scoring.minimal.max) 
      return socialAnxietyCriteria.scoring.minimal.description;
    if (score <= socialAnxietyCriteria.scoring.mild.max) 
      return socialAnxietyCriteria.scoring.mild.description;
    if (score <= socialAnxietyCriteria.scoring.moderate.max) 
      return socialAnxietyCriteria.scoring.moderate.description;
    return socialAnxietyCriteria.scoring.severe.description;
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    let severityLevel = '';
    if (totalScore <= socialAnxietyCriteria.scoring.minimal.max) {
      severityLevel = socialAnxietyCriteria.scoring.minimal.description;
    } else if (totalScore <= socialAnxietyCriteria.scoring.mild.max) {
      severityLevel = socialAnxietyCriteria.scoring.mild.description;
    } else if (totalScore <= socialAnxietyCriteria.scoring.moderate.max) {
      severityLevel = socialAnxietyCriteria.scoring.moderate.description;
    } else {
      severityLevel = socialAnxietyCriteria.scoring.severe.description;
    }

    const prominentSymptoms = Object.entries(answers)
      .filter(([_, value]) => Number(value) >= 3)
      .map(([key]) => {
        const questionNumber = parseInt(key.replace('SA', ''));
        return {
          question: questionNumber,
          severity: Number(answers[key]),
          response: childSocialAnxietyTest.questions[questionNumber - 1].text
        };
      });

    return {
      totalScore,
      severityLevel,
      factorScores: {},
      factorAverages: {},
      riskFactors: [],
      prominentSymptoms,
      requiresTreatment: totalScore >= 50,
      interpretation: {
        overall: `Danışanın Çocuklar İçin Sosyal Anksiyete Ölçeği toplam puanı ${totalScore} olup, bu puan "${severityLevel}" düzeyine işaret etmektedir.`,
        factors: `
          Toplam puan: ${totalScore}/100
          Şiddet düzeyi: ${severityLevel}
          Tedavi gereksinimi: ${totalScore >= 50 ? 'Var' : 'Yok'}
        `,
        risks: 'Belirgin risk faktörü saptanmamıştır.',
        symptoms: prominentSymptoms.length > 0
          ? `Öne çıkan belirtiler:\n${prominentSymptoms.map(s => `- ${s.response}`).join('\n')}`
          : 'Belirgin semptom saptanmamıştır.',
        recommendations: [
          totalScore >= 75 ? 'Acil psikiyatrik değerlendirme önerilir.' : '',
          totalScore >= 50 ? 'Klinik değerlendirme önerilir.' : 'Periyodik kontrol önerilir.'
        ].filter(r => r !== '')
      }
    };
  }
}; 