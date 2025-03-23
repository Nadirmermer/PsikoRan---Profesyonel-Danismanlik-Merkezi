import { Test } from './types';

// Test başlangıç açıklaması
export const bdöIntro = `
Bilişsel Duygu Düzenleme Ölçeği, stres veren yaşam olayları sonrasında kişilerin kullandığı bilişsel duygu düzenleme stratejilerini ölçmeyi amaçlayan bir değerlendirme aracıdır.

Hemen hepimizin yaşamında hoş olmayan kötü şeyler olabilmekte ve bu olaylara verdiğimiz tepkiler de birbirinden farklı olabilmektedir. Aşağıdaki cümlelerde başınıza gelmiş olan olumsuz ya da nahoş olaylar karşısında genellikle ne düşündüğünüz sorulmaktadır. Her bir cümleyi okuduktan sonra sizin durumunuza en uygun seçeneği işaretleyerek yanıt vermeniz istenmektedir.
`;

export const bilisselDuyguDuzenlemeTest: Test = {
  id: 'bdo',
  name: 'Bilişsel Duygu Düzenleme Ölçeği',
  description: bdöIntro,
  infoText: 'Bu ölçek, stres veren yaşam olayları sonrasında kişilerin kullandığı bilişsel duygu düzenleme stratejilerini ölçmeyi amaçlar. Dokuz farklı bilişsel başa çıkma stratejisini ölçen 36 maddeden oluşur. Her alt boyuttan alınan yüksek puan, o başa çıkma stratejisinin daha fazla kullanıldığını göstermektedir.',
  reference: 'Garnefski, N., Kraaij, V., & Spinhoven, P. (2002). Manual for the use of the Cognitive Emotion Regulation Questionnaire. Leiderdorp, The Netherlands: DATEC. Onat, O. ve Otrar, M. (2010). Bilişsel duygu düzenleme ölçeğinin Türkçeye uyarlanması: Geçerlik ve güvenirlik çalışmaları. M.Ü. Atatürk Eğitim Fakültesi Eğitim Bilimleri Dergisi, 31, 123-143.',
  
  questions: [
    {
      id: 'BDO1',
      text: 'Bunun suçlusu benim diye düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO2',
      text: 'Artık bu olayın olup bittiğini kabul etmek zorunda olduğumu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO3',
      text: 'Bu yaşadığımla ilgili ne hissettiğimi düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO4',
      text: 'Yaşadıklarımdan daha hoş olan şeyleri düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO5',
      text: 'Yapabileceğim en iyi şeyi düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO6',
      text: 'Bu olaydan bir şeyler öğrenebileceğimi düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO7',
      text: 'Her şey çok daha kötü olabilirdi diye düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO8',
      text: 'Yaşadığım olayın başkalarının başına gelenlerden daha kötü olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO9',
      text: 'Bu olayda başkalarının suçu olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO10',
      text: 'Bu olayın tek sorumlusunun ben olduğumu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO11',
      text: 'Durumu kabullenmek zorunda olduğumu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO12',
      text: 'Zihnim yaşadığım olay hakkında ne düşündüğüm ve hissettiğimle sürekli meşgul olur.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO13',
      text: 'Olayla hiç ilgisi olmayan hoş şeyler düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO14',
      text: 'Bu durumla en iyi nasıl başa çıkabileceğimi düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO15',
      text: 'Başımdan geçenlerin bir sonucu olarak daha güçlü bir insan haline gelebileceğimi düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO16',
      text: 'Diğer insanların çok daha kötü tecrübeler geçirdiklerini düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO17',
      text: 'Başıma gelen olayın ne kadar korkunç olduğunu düşünüp dururum.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO18',
      text: 'Başımdan geçen olaydan başkalarının sorumlu olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO19',
      text: 'Bu olayda yaptığım hataları düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO20',
      text: 'Bu olayla ilgili hiçbir şeyi değiştiremeyeceğimi düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO21',
      text: 'Bu olayla ilgili neden böyle hissettiğimi anlamak isterim.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO22',
      text: 'Başımdan geçen olay yerine hoş bir şeyler düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO23',
      text: 'Bu durumu nasıl değiştireceğimi düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO24',
      text: 'Bu durumun olumlu yanlarının da olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO25',
      text: 'Diğer şeylerle karşılaştırıldığında bunun o kadar da kötü olmadığını düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO26',
      text: 'Yaşadığım bu şeyin bir insanın başına gelebilecek en kötü şey olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO27',
      text: 'Bu olayda diğerlerinin yaptığı hataları düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO28',
      text: 'Esas sebebin kendimle ilgili olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO29',
      text: 'Bununla yaşamayı öğrenmem gerektiğini düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO30',
      text: 'Bu durumun bende uyandırdığı duygularla boğuşurum.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO31',
      text: 'Hoş olayları düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO32',
      text: 'Yapabileceğim en iyi şeyle ilgili bir plan düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO33',
      text: 'Bu durumun olumlu yanlarını ararım.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO34',
      text: 'Kendime hayatta daha kötü şeylerin de olduğunu söylerim.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO35',
      text: 'Sürekli bu durumun ne kadar korkunç olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    },
    {
      id: 'BDO36',
      text: 'Esas sebebin başkalarıyla ilgili olduğunu düşünürüm.',
      options: [
        { value: 1, text: 'Hiç' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Ara Sıra' },
        { value: 4, text: 'Sıklıkla' },
        { value: 5, text: 'Her Zaman' }
      ]
    }
  ],
  
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  
  interpretScore: (score) => {
    return "Bu ölçek alt ölçekler bazında değerlendirilmektedir. Her bir alt ölçekten alınan yüksek puan, o stratejinin daha çok kullanıldığını gösterir.";
  },
  
  generateReport: (answers) => {
    // Alt ölçeklerin hesaplanması
    const kendineSuclama = ['BDO1', 'BDO10', 'BDO19', 'BDO28'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const kabul = ['BDO2', 'BDO11', 'BDO20', 'BDO29'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const ruminasyon = ['BDO3', 'BDO12', 'BDO21', 'BDO30'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const olumluYenidenOdaklanma = ['BDO4', 'BDO13', 'BDO22', 'BDO31'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const planlamaYenidenOdaklanma = ['BDO5', 'BDO14', 'BDO23', 'BDO32'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const olumluYenidenDegerlendirme = ['BDO6', 'BDO15', 'BDO24', 'BDO33'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const olayinDegeriniAzaltma = ['BDO7', 'BDO16', 'BDO25', 'BDO34'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const felaketlestirme = ['BDO8', 'BDO17', 'BDO26', 'BDO35'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    const digerleriniSuclama = ['BDO9', 'BDO18', 'BDO27', 'BDO36'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    
    // Toplam puanın hesaplanması
    const totalScore = kendineSuclama + kabul + ruminasyon + olumluYenidenOdaklanma + 
      planlamaYenidenOdaklanma + olumluYenidenDegerlendirme + olayinDegeriniAzaltma + 
      felaketlestirme + digerleriniSuclama;
    
    // Uyumlu ve uyumsuz stratejiler
    const uyumluStratejiler = kabul + olumluYenidenOdaklanma + planlamaYenidenOdaklanma + 
      olumluYenidenDegerlendirme + olayinDegeriniAzaltma;
    
    const uyumsuzStratejiler = kendineSuclama + ruminasyon + felaketlestirme + digerleriniSuclama;
    
    // Risk faktörleri
    const riskFactors = [];
    if (felaketlestirme > 15) riskFactors.push('Yüksek felaketleştirme');
    if (kendineSuclama > 15) riskFactors.push('Yüksek kendini suçlama');
    if (digerleriniSuclama > 15) riskFactors.push('Yüksek başkalarını suçlama');
    if (ruminasyon > 15) riskFactors.push('Yüksek ruminasyon');
    if (uyumluStratejiler < 60) riskFactors.push('Düşük uyumlu stratejiler');
    
    return {
      score: totalScore,
      factorScores: {
        'Kendini Suçlama': kendineSuclama,
        'Kabul': kabul,
        'Ruminasyon': ruminasyon,
        'Olumlu Yeniden Odaklanma': olumluYenidenOdaklanma,
        'Plan Yapmaya Yeniden Odaklanma': planlamaYenidenOdaklanma,
        'Olumlu Yeniden Değerlendirme': olumluYenidenDegerlendirme,
        'Olayın Değerini Azaltma': olayinDegeriniAzaltma,
        'Felaketleştirme': felaketlestirme,
        'Diğerlerini Suçlama': digerleriniSuclama
      },
      factorAverages: {
        'Uyumlu Stratejiler': uyumluStratejiler / 5,
        'Uyumsuz Stratejiler': uyumsuzStratejiler / 4
      },
      severityLevel: "Bilişsel duygu düzenleme stratejileri değerlendirmesi",
      requiresTreatment: riskFactors.length > 2,
      riskFactors: riskFactors,
      chartData: {
        labels: [
          'Kendini Suçlama', 
          'Kabul', 
          'Ruminasyon', 
          'Olumlu Yeniden Odaklanma', 
          'Plan Yapmaya Yeniden Odaklanma', 
          'Olumlu Yeniden Değerlendirme', 
          'Olayın Değerini Azaltma',
          'Felaketleştirme',
          'Diğerlerini Suçlama'
        ],
        datasets: [
          {
            label: 'Alt Ölçek Puanları',
            data: [
              kendineSuclama, 
              kabul, 
              ruminasyon, 
              olumluYenidenOdaklanma, 
              planlamaYenidenOdaklanma, 
              olumluYenidenDegerlendirme, 
              olayinDegeriniAzaltma,
              felaketlestirme,
              digerleriniSuclama
            ],
            backgroundColor: { r: 54, g: 162, b: 235 }
          }
        ]
      }
    };
  }
}; 