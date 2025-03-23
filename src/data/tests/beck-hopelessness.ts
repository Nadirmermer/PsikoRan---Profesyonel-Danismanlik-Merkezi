import { Test } from './types';

// Test başlangıç açıklaması
export const beckHopelessnessIntro = `
Aşağıda geleceğe ait düşünceleri ifade eden bazı cümleler verilmiştir. Lütfen her bir
ifadeyi okuyarak, bunların size ne kadar uygun olduğuna karar veriniz ve ‟Evet” için (E) ya da
“Hayır” için (H) seçeneğini işaretleyiniz.`;

// Puan aralıklarına göre umutsuzluk seviyesini belirleyen yardımcı fonksiyon
const getHopelessnessLevel = (score: number): string => {
  if (score >= 0 && score <= 3) {
    return 'Umutsuzluğun tamamen olmadığı durum';
  } else if (score >= 4 && score <= 8) {
    return 'Hafif umutsuzluk';
  } else if (score >= 9 && score <= 14) {
    return 'Orta seviyede umutsuzluk';
  } else if (score >= 15 && score <= 20) {
    return 'İleri derecede umutsuzluk';
  }
  return 'Değerlendirme tamamlandı';
};

export const beckHopelessnessTest: Test = {
  id: 'beck-hopelessness',
  name: 'Beck Umutsuzluk Ölçeği',
  description: beckHopelessnessIntro,
  infoText: 'Bu ölçek, kişinin geleceğe yönelik beklentilerini ölçmek için kullanılır.',
  reference: 'https://www.researchgate.net/profile/Elif-Gueneri-Yoeyen/publication/331407570_Psikolojide_Kullanilan_Olcekler/links/5c77e2c0458515831f76da91/Psikolojide-Kullanilan-Oelcekler.pdf',
  
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
      text: 'Kendimle ilgili şeyleri düzeltemediğime göre çabalamayı bıraksam iyi olur.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH3',
      text: 'İşler kötü giderken bile, her şeyin hep böyle kalmayacağını bilmek beni rahatlatıyor.',
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
      text: 'Benim için çok önemli olan konularda, ileride çok başarılı olacağımı umuyorum.',
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
      text: 'Dünya nimetlerinden sıradan bir insandan daha çok yararlanacağımı düşünüyorum.',
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
      text: 'Gelecek benim için hoş şeylerden çok, tatsızlıklarla dolu gözüküyor.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH12',
      text: 'Gelecekten, özlediğim şeylere kavurabileceğimi ummuyorum.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH13',
      text: 'Geleceğe baktığımda, Şimdikinden çok daha mutlu olacağıma inanıyorum.',
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
      text: 'Arzu ettiğim şeyleri elde edemediğime göre, bir şeyler istemek aptallık olur.',
      options: [
        { value: 1, text: 'Evet' },
        { value: 0, text: 'Hayır' }
      ]
    },
    {
      id: 'BH17',
      text: 'Gelecekte gerçek doyuma ulaşmam olanaksız gibi',
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
    return getHopelessnessLevel(score);
  },
  
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const severityLevel = getHopelessnessLevel(totalScore);
    
    // Alt faktör puanlarını hesapla
    const factorScores = {
      gelecekIlgiliDuygular: ['BH1', 'BH6', 'BH13', 'BH15', 'BH19'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      motivasyonKaybi: ['BH2', 'BH3', 'BH9', 'BH11', 'BH12', 'BH16', 'BH17', 'BH20'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      gelecekIlgiliDusunceler: ['BH4', 'BH7', 'BH8', 'BH14', 'BH18'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0)
    };
    
    // Alt faktör ortalamalarını hesapla
    const factorAverages = {
      gelecekIlgiliDuygular: factorScores.gelecekIlgiliDuygular / 5,
      motivasyonKaybi: factorScores.motivasyonKaybi / 8,
      gelecekIlgiliDusunceler: factorScores.gelecekIlgiliDusunceler / 5
    };
    
    return {
      score: totalScore,
      severityLevel: severityLevel,
      factorScores: factorScores,
      factorAverages: factorAverages,
      riskFactors: [],
      requiresTreatment: false
    };
  }
}; 