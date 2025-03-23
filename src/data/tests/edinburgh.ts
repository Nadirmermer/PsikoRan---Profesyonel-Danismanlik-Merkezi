import { Test } from './types';

// Test başlangıç açıklaması
export const edinburghIntro = `
Yakın zamanlarda bebeğiniz oldu. Sizin son hafta içindeki duygularınızı öğrenmek istiyoruz. 
Lütfen tüm soruları yalnızca bugün için değil, son 7 gün içinde, kendinizi nasıl hissettiğinizi 
en iyi tanımlayan ifadeyi işaretleyiniz.

Cox, Holden ve Sagovsky tarafından 1987 yılında geliştirilmiş olan ve Edinburgh Postnatal Depression Scale (EPDS) ismi ile British Journal of Psychiatry'de yayınlanan ölçek, Engindeniz, Küey ve Kültür tarafından 1996 yılında geçerlilik ve güvenilirlik çalışmaları yapılarak Türkçeye uyarlanmıştır. Ölçeğin kesme puanı 12/13 olarak belirlenmiştir ve 13 puan ve üzerinde alan bireyler depresyon yaşıyor olarak değerlendirilmektedir.
`;

export const edinburghTest: Test = {
  id: 'edinburgh',
  name: 'Edinburgh Doğum Sonrası Depresyon Ölçeği (EDSDÖ)',
  description: edinburghIntro,
  infoText: 'Bu ölçek, doğum sonrası depresyon riskini belirlemek için kullanılır. Son 7 gün içindeki durumu değerlendirir. Güvenilirlik çalışmasında, cronbach alfa katsayısı 0.79 olarak bulunmuştur ve madde-toplam puan korelasyon katsayıları 0.68-0.73 arasında değişmektedir.',
  reference: 'https://www.researchgate.net/profile/Elif-Gueneri-Yoeyen/publication/331407570_Psikolojide_Kullanilan_Olcekler/links/5c77e2c0458515831f76da91/Psikolojide-Kullanilan-Oelcekler.pdf',
  
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
      text: 'İyi bir neden olmadığı halde korkuyor ya da panikliyorum',
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
        { value: 3, text: 'Evet, çoğu zaman hiç başa çıkamıyorum.' },
        { value: 2, text: 'Evet, bazen eskisi gibi başa çıkamıyorum.' },
        { value: 1, text: 'Hayır, çoğu zaman oldukça iyi başa çıkabiliyorum.' },
        { value: 0, text: 'Hayır, her zamanki gibi başa çıkabiliyorum' }
      ]
    },
    {
      id: 'ED7',
      text: 'Öylesine mutsuzum ki uyumakta zorlanıyorum',
      options: [
        { value: 3, text: 'Evet, çoğu zaman' },
        { value: 2, text: 'Evet, bazen' },
        { value: 1, text: 'Çok sık değil' },
        { value: 0, text: 'Hayır, hiçbir zaman' }
      ]
    },
    {
      id: 'ED8',
      text: 'Kendimi üzüntülü ya da çökkün hissediyorum',
      options: [
        { value: 3, text: 'Evet, çoğu zaman' },
        { value: 2, text: 'Evet, bazen' },
        { value: 1, text: 'Çok sık değil' },
        { value: 0, text: 'Hayır, hiçbir zaman' }
      ]
    },
    {
      id: 'ED9',
      text: 'Öylesine mutsuzum ki ağlıyorum',
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
        { value: 2, text: 'Bazen.' },
        { value: 1, text: 'Hemen hemen hiç' },
        { value: 0, text: 'Asla' }
      ]
    }
  ],
  
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  
  interpretScore: (score) => {
    if (score <= 12)
      return 'Normal düzey';
    return 'Depresyon riski';
  },
  
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    // Şiddet düzeyini belirle
    let severityLevel = '';
    if (totalScore <= 12) {
      severityLevel = 'Normal düzey';
    } else {
      severityLevel = 'Depresyon riski';
    }
    
    // Tedavi gerekliliğini belirle
    const requiresTreatment = totalScore >= 13;
    
    // Risk faktörlerini belirle
    const riskFactors = [];
    if (totalScore >= 13) {
      riskFactors.push('Doğum sonrası depresyon riski');
    }
    
    // Faktör puanlarını hesapla (Türkçe uyarlamasında yapılan faktör analizine göre)
    const factorScores = {
      neselenememeEndiseCokkunDurumdurumUyku: ['ED1', 'ED4', 'ED7', 'ED8', 'ED9'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      suclulukPanik: ['ED3', 'ED5'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      gelecegeHevesleBasaCikmaguclugu: ['ED2', 'ED6'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0)
    };
    
    // Faktör ortalamalarını hesapla
    const factorAverages = {
      neselenememeEndiseCokkunDurumdurumUyku: factorScores.neselenememeEndiseCokkunDurumdurumUyku / 5,
      suclulukPanik: factorScores.suclulukPanik / 2,
      gelecegeHevesleBasaCikmaguclugu: factorScores.gelecegeHevesleBasaCikmaguclugu / 2
    };
    
    return {
      score: totalScore,
      severityLevel,
      requiresTreatment,
      riskFactors,
      factorScores,
      factorAverages
    };
  }
}; 