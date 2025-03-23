import { Test } from './types';

export const connersEbeveynTest: Test = {
  id: 'conners-parent',
  name: 'Conners Ebeveyn Derecelendirme Ölçeği (CADÖ-48)(BİTMEDİ)',
  description: 'Yıkıcı davranış bozukluklarının taranması amacıyla geliştirilmiş ebeveynler tarafından doldurulan bir ölçek.',
  instructions: 'Lütfen çocuğunuzun davranışlarını düşünerek aşağıdaki soruları yanıtlayınız. Her soru için "Hiçbir zaman", "Nadiren", "Sıklıkla" ve "Her zaman" seçeneklerinden birini işaretleyiniz.',
  infoText: 'Conners Ebeveyn Derecelendirme Ölçeği (CADÖ-48), çocuklarda görülen yıkıcı davranış bozukluklarını değerlendirmek amacıyla geliştirilmiş, ebeveynler tarafından doldurulan bir ölçektir. Ölçek, dikkat eksikliği, hiperaktivite, karşı olma karşı gelme ve davranım bozukluğu gibi alanlardaki sorunları taramak için kullanılır.',
  reference: 'Dereboy ve arkadaşları (2007)',
  questions: [
    {
      id: 'q1',
      text: 'Eli boş durmaz, sürekli bir şeylerle oynar. (Tırnak, parmak gibi)',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q2',
      text: 'Büyüklere arsız ve küstah davranır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q3',
      text: 'Arkadaşlık kurmada ve sürdürmede zorlanır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q4',
      text: 'Çabuk heyecanlanır, ataktır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q5',
      text: 'Her şeye karışır ve yönetmek ister.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q6',
      text: 'Bir şeyler çiğner veya emer. (parmak, giysi gibi)',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q7',
      text: 'Sık sık ve kolay ağlar.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q8',
      text: 'Her an sataşmaya hazırdır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q9',
      text: 'Hayallere dalar.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q10',
      text: 'Zor öğrenir.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q11',
      text: 'Kıpır kıpırdır, tez canlıdır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q12',
      text: 'Ürkektir (yeni durum, insan ve yerlerden)',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q13',
      text: 'Yerinde duramaz, her an harekete hazırdır',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q14',
      text: 'Zarar verir.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q15',
      text: 'Yalan söyler, masallar anlatır',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q16',
      text: 'Utangaçtır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q17',
      text: 'Yaşıtlarından daha sık başını derde sokar.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q18',
      text: 'Yaşıtlarından farklı konuşur (Çocuksu konuşma, kekeleme, zor anlaşılma gibi).',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q19',
      text: 'Hatalarını kabullenmez, başkalarını suçlar.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q20',
      text: 'Kavgacıdır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q21',
      text: 'Somurtkan ve asık suratlıdır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q22',
      text: 'Çalma huyu vardır',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q23',
      text: 'Söz dinlemez.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q24',
      text: 'Başkalarına göre endişelidir (Yalnız kalma, hastalanma, ölüm konusunda).',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q25',
      text: 'Başladığı işin sonunu getiremez.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q26',
      text: 'Hassastır, kolay incinir.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q27',
      text: 'Kabadayılık taslar, başkalarını rahatsız eder.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q28',
      text: 'Tekrarlayıcı, durduramadığı hareketleri vardır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q29',
      text: 'Kaba ve acımasızdır.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q30',
      text: 'Yaşına göre çocuksudur.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q31',
      text: 'Dikkati kolay dağılır ya da uzun süre dikkatini toplayamaz.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q32',
      text: 'Baş ağrıları olur.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q33',
      text: 'Ruh halinde ani ve göze batan değişiklikler olur.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q34',
      text: 'Kurallar ve kısıtlamalardan hoşlanmaz ve uymaz.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q35',
      text: 'Sürekli kavga eder.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q36',
      text: 'Kardeşleri ile iyi geçinemez.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q37',
      text: 'Zora gelemez.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q38',
      text: 'Diğer çocukları rahatsız eder.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q39',
      text: 'Genelde hoşnutsuz bir çocuktur.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q40',
      text: 'Yeme sorunları vardır (İştahsızdır, yemek sırasında sofradan sık kalkar).',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q41',
      text: 'Karın ağrıları olur.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q42',
      text: 'Uyku sorunları vardır (Uykuya kolay dalamaz geceleri kalkar).',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q43',
      text: 'Çeşitli ağrı ve sancıları olur.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q44',
      text: 'Bulantı kusmaları olur.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q45',
      text: 'Aile içinde daha az kayırıldığını düşünür.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q46',
      text: 'Övünür, böbürlenir.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q47',
      text: 'İtilip kakılmaya müsaittir.',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    },
    {
      id: 'q48',
      text: 'Dışkılama sorunları vardır (Sık ishaller, kabızlık ve düzensiz tuvalet alışkanlığı gibi).',
      options: [
        { value: 0, text: 'Hiçbir zaman' },
        { value: 1, text: 'Nadiren' },
        { value: 2, text: 'Sıklıkla' },
        { value: 3, text: 'Her zaman' }
      ]
    }
  ],
  calculateScore: (answers) => {
    // Alt ölçek puanlarını hesapla
    const dikkatEksikligi = [9, 10, 25, 31];
    const hiperaktivite = [1, 4, 6, 11, 13, 28];
    const karsiOlmaKarsiGelme = [2, 5, 8, 15, 19, 23, 34, 46];
    const davranisProblemleri = [14, 17, 20, 22, 27, 29, 35, 38];
    
    // Alt ölçek puanlarını hesapla
    let dikkatPuani = 0;
    let hiperaktivitePuani = 0;
    let karsiOlmaPuani = 0;
    let davranisPuani = 0;
    
    Object.entries(answers).forEach(([questionId, value]) => {
      const qId = parseInt(questionId.replace('q', ''));
      
      if (dikkatEksikligi.includes(qId)) {
        dikkatPuani += value;
      }
      
      if (hiperaktivite.includes(qId)) {
        hiperaktivitePuani += value;
      }
      
      if (karsiOlmaKarsiGelme.includes(qId)) {
        karsiOlmaPuani += value;
      }
      
      if (davranisProblemleri.includes(qId)) {
        davranisPuani += value;
      }
    });
    
    // Toplam puanı hesapla
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    
    return totalScore;
  },
  interpretScore: (score) => {
    return `Ölçekten alınan yüksek puanlar yıkıcı bozukluklara özgü belirtilerin yoğunluğunu göstermektedir.`;
  },
  generateReport: (answers) => {
    // Alt ölçek puanlarını hesapla
    const dikkatEksikligi = [9, 10, 25, 31];
    const hiperaktivite = [1, 4, 6, 11, 13, 28];
    const karsiOlmaKarsiGelme = [2, 5, 8, 15, 19, 23, 34, 46];
    const davranisProblemleri = [14, 17, 20, 22, 27, 29, 35, 38];
    
    // Alt ölçek puanlarını hesapla
    let dikkatPuani = 0;
    let hiperaktivitePuani = 0;
    let karsiOlmaPuani = 0;
    let davranisPuani = 0;
    
    Object.entries(answers).forEach(([questionId, value]) => {
      const qId = parseInt(questionId.replace('q', ''));
      
      if (dikkatEksikligi.includes(qId)) {
        dikkatPuani += value;
      }
      
      if (hiperaktivite.includes(qId)) {
        hiperaktivitePuani += value;
      }
      
      if (karsiOlmaKarsiGelme.includes(qId)) {
        karsiOlmaPuani += value;
      }
      
      if (davranisProblemleri.includes(qId)) {
        davranisPuani += value;
      }
    });
    
    // Toplam puanı hesapla
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    
    // Kesme puanlarına göre risk faktörlerini belirle
    const riskFactors = [];
    if (dikkatPuani >= 5) {
      riskFactors.push('Dikkat eksikliği riski');
    }
    if (hiperaktivitePuani >= 6) {
      riskFactors.push('Hiperaktivite riski');
    }
    if (karsiOlmaPuani >= 7) {
      riskFactors.push('Karşı olma karşı gelme riski');
    }
    if (davranisPuani >= 18) {
      riskFactors.push('Davranım bozukluğu riski');
    }
    
    // Şiddet seviyesini belirle
    let severityLevel = 'Normal';
    if (riskFactors.length === 1) {
      severityLevel = 'Hafif';
    } else if (riskFactors.length === 2) {
      severityLevel = 'Orta';
    } else if (riskFactors.length > 2) {
      severityLevel = 'Ciddi';
    }
    
    // Tedavi gerekliliğini belirle
    const requiresTreatment = riskFactors.length > 0;
    
    // Faktör puanlarını kaydet
    const factorScores = {
      'Dikkat Eksikliği': dikkatPuani,
      'Hiperaktivite': hiperaktivitePuani,
      'Karşı Olma Karşı Gelme': karsiOlmaPuani,
      'Davranış Problemleri': davranisPuani
    };
    
    // Faktör ortalamalarını kaydet
    const factorAverages = {
      'Dikkat Eksikliği': dikkatPuani / dikkatEksikligi.length,
      'Hiperaktivite': hiperaktivitePuani / hiperaktivite.length,
      'Karşı Olma Karşı Gelme': karsiOlmaPuani / karsiOlmaKarsiGelme.length,
      'Davranış Problemleri': davranisPuani / davranisProblemleri.length
    };
    
    // Grafik verilerini hazırla
    const chartData = {
      labels: ['Dikkat Eksikliği', 'Hiperaktivite', 'Karşı Olma Karşı Gelme', 'Davranış Problemleri'],
      datasets: [
        {
          label: 'Alt Ölçek Puanları',
          data: [dikkatPuani, hiperaktivitePuani, karsiOlmaPuani, davranisPuani],
          backgroundColor: { r: 75, g: 192, b: 192 }
        }
      ]
    };
    
    return {
      score: totalScore,
      factorAverages,
      factorScores,
      severityLevel,
      requiresTreatment,
      riskFactors,
      chartData
    };
  }
}; 