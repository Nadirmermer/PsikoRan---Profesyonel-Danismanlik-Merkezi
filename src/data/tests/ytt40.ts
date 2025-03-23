import { Test } from './types';

// Test başlangıç açıklaması
export const ytt40Intro = `
Yeme Tutum Testi (YTT-40), Garner ve Garfinkel tarafından geliştirilmiş olup, Savaşır ve Işık tarafından 1989 yılında Türkçeye uyarlanmıştır. 
Ölçeğin iç tutarlılığı için cronbach alfa katsayısı 0.70 ve test tekrar test güvenirliği korelasyonu 0.65 olarak belirlenmiştir.

Aşağıda yeme tutumları ile ilgili çeşitli ifadeler bulunmaktadır. Her ifadeyi dikkatlice okuyun ve size en uygun gelen seçeneği işaretleyin.
`;

export const ytt40Test: Test = {
  id: 'ytt40',
  name: 'Yeme Tutum Testi (YTT-40)',
  description: ytt40Intro,
  infoText: 'Bu test, bireylerin yeme tutumlarını değerlendirmek amacıyla kullanılan, 40 maddeden oluşan bir ölçektir. Puan artışı yeme tutumlarındaki bozulmayı ifade etmektedir. Ölçeğin kesme noktası 30 puan olarak belirlenmiştir.',
  reference: 'Savaşır, I., & Erol, N. (1989). Yeme Tutum Testi: Anoreksiya nervoza belirtileri indeksi. Psikoloji Dergisi, 7(23), 19-25.',

  questions: [
    {
      id: 'YTT1',
      text: 'Başkaları ile birlikte yemek yemekten hoşlanırım.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT2',
      text: 'Başkaları için yemek pişiririm, fakat pişirdiğim yemeği yemem',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT3',
      text: 'Yemekten önce sıkıntılı olurum',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT4',
      text: 'Şişmanlıktan ödüm kopar.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT5',
      text: 'Acıktığımda yemek yememeye çalışırım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT6',
      text: 'Aklım fikrim yemektedir.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT7',
      text: 'Yemek yemeyi durduramadığım zamanlar olur.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT8',
      text: 'Yiyeceğimi küçük küçük parçalara bölerim.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT9',
      text: 'Yediğim yiyeceğin kalorisini bilirim.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT10',
      text: 'Ekmek, patates, pirinç gibi yüksek kalorili yiyeceklerden kaçınırım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT11',
      text: 'Yemeklerden sonra şişkinlik hissederim.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT12',
      text: 'Ailem fazla yememi bekler.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT13',
      text: 'Yemek yedikten sonra kusarım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT14',
      text: 'Yemek yedikten sonra aşırı suçluluk duyarım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT15',
      text: 'Tek düşüncem daha zayıf olmaktır.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT16',
      text: 'Aldığım kalorileri yakmak için yorulana kadar egzersiz yaparım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT17',
      text: 'Günde birkaç kez tartılırım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT18',
      text: 'Vücudumu saran dar elbiselerden hoşlanırım.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT19',
      text: 'Et yemekten hoşlanırım.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT20',
      text: 'Sabahları erken uyanırım.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT21',
      text: 'Günlerce aynı yemeği yerim.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT22',
      text: 'Egzersiz yaptığımda harcadığım kalorileri hesaplarım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT23',
      text: 'Adetlerim düzenlidir.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT24',
      text: 'Başkaları zayıf olduğumu düşünür.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT25',
      text: 'Şişmanlayacağım (Vücudumun yağ toplayacağı) düşüncesi zihnimi meşgul eder.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT26',
      text: 'Yemeklerimi yemek başkalarınkinden uzun sürer.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT27',
      text: 'Lokantada yemek yemeyi severim.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT28',
      text: 'Müshil kullanırım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT29',
      text: 'Şekerli yiyeceklerden kaçınırım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT30',
      text: 'Diyet (perhiz) yemekleri yerim.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT31',
      text: 'Yaşamımı yiyeceğin kontrol ettiğini düşünürüm.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT32',
      text: 'Yiyecek konusunda kendimi denetleyebilirim.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT33',
      text: 'Yemek konusunda başkalarının bana baskı yaptığını hissederim.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT34',
      text: 'Yiyecekle ilgili düşünceler çok zamanımı alır.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT35',
      text: 'Kabızlıktan yakınırım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT36',
      text: 'Tatlı yedikten sonra rahatsız olurum.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT37',
      text: 'Perhiz yaparım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT38',
      text: 'Midemin boş olmasından hoşlanırım.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT39',
      text: 'Şekerli, yağlı yiyecekleri denemekten hoşlanırım.',
      options: [
        { value: 0, text: 'Daima' },
        { value: 0, text: 'Çok sık' },
        { value: 0, text: 'Sık sık' },
        { value: 1, text: 'Bazen' },
        { value: 2, text: 'Nadiren' },
        { value: 3, text: 'Hiçbir zaman' }
      ]
    },
    {
      id: 'YTT40',
      text: 'Yemeklerden sonra içimden kusmak gelir.',
      options: [
        { value: 3, text: 'Daima' },
        { value: 2, text: 'Çok sık' },
        { value: 1, text: 'Sık sık' },
        { value: 0, text: 'Bazen' },
        { value: 0, text: 'Nadiren' },
        { value: 0, text: 'Hiçbir zaman' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score >= 30) {
      return 'Yeme tutumu bozuk';
    } else {
      return 'Normal yeme tutumu';
    }
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    let severityMessage = '';
    if (totalScore >= 30) {
      severityMessage = 'Yeme tutumu bozuk';
    } else {
      severityMessage = 'Normal yeme tutumu';
    }
    
    return {
      score: totalScore,
      severityLevel: severityMessage,
      factorScores: {},
      factorAverages: {},
      riskFactors: totalScore >= 30 ? ['Yeme bozukluğu riski'] : [],
      requiresTreatment: totalScore >= 30
    };
  }
}; 