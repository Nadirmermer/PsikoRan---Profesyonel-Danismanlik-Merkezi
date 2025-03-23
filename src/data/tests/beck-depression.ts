import { Test } from './types';

// Test başlangıç açıklaması
export const beckDepressionIntro = `
Aşağıda, kişilerin ruh durumlarını ifade ederken kullandıkları bazı cümleler verilmiştir.
Her madde bir çeşit ruh durumunu anlatmaktadır. Her maddede o durumun derecesini belirleyen
4 seçenek vardır. Lütfen bu seçenekleri dikkatle okuyunuz. Son bir hafta içindeki (şu an dahil)
kendi ruh durumunuzu göz önünde bulundurarak, size en uygun olan ifadeyi seçiniz.
`;

// Puan aralıklarına göre depresyon seviyesini belirleyen yardımcı fonksiyon
const getDepressionLevel = (score: number): string => {
  if (score >= 0 && score <= 4) {
    return 'Normal';
  } else if (score >= 5 && score <= 9) {
    return 'Normal';
  } else if (score >= 10 && score <= 18) {
    return 'Hafif-orta depresyon';
  } else if (score >= 19 && score <= 29) {
    return 'Orta-şiddetli depresyon';
  } else if (score >= 30 && score <= 63) {
    return 'Şiddetli depresyon';
  }
  return 'Değerlendirme tamamlandı';
};

export const beckDepressionTest: Test = {
  id: 'beck-depression',
  name: 'Beck Depresyon Testi',
  description: beckDepressionIntro,
  infoText: 'Bu test, kişinin depresif belirtilerini değerlendirmek için kullanılır.',
  reference: 'https://www.researchgate.net/profile/Elif-Gueneri-Yoeyen/publication/331407570_Psikolojide_Kullanilan_Olcekler/links/5c77e2c0458515831f76da91/Psikolojide-Kullanilan-Oelcekler.pdf',
  questions: [
    {
      id: 'BD1',
      options: [
        { value: 0, text: 'Kendimi üzgün hissetmiyorum.' },
        { value: 1, text: 'Kendimi üzgün hissediyorum.' },
        { value: 2, text: 'Her zaman için üzgünüm ve kendimi bu duygudan kurtaramıyorum.' },
        { value: 3, text: 'Öylesine üzgün ve mutsuzum ki dayanamıyorum.' }
      ]
    },
    {
      id: 'BD2',
      options: [
        { value: 0, text: 'Gelecekten umutsuz değilim.' },
        { value: 1, text: 'Gelecek konusunda umutsuzum.' },
        { value: 2, text: 'Gelecekten beklediğim hiçbir şey yok.' },
        { value: 3, text: 'Benim için gelecek olmadığı gibi bu durum düzelmeyecek.' }
      ]
    },
    {
      id: 'BD3',
      options: [
        { value: 0, text: 'Kendimi başarısız görmüyorum.' },
        { value: 1, text: 'Herkesten daha fazla başarısızlıklarım oldu sayılır.' },
        { value: 2, text: 'Geriye dönüp baktığımda, pek çok başarısızlıklarımın olduğunu görüyorum.' },
        { value: 3, text: 'Kendimi bir" insan olarak tümüyle başarısız görüyorum.' }
      ]
    },
    {
      id: 'BD4',
      options: [
        { value: 0, text: 'Her şeyden eskisi kadar zevk alabiliyorum.' },
        { value: 1, text: 'Her şeyden eskisi kadar zevk alamıyorum' },
        { value: 2, text: 'Artık hiçbir şeyden gerçek bir zevk alamıyorum.' },
        { value: 3, text: 'Beni doyuran hiçbir şey yok. Her şey çok can sıkıcı.' }
      ]
    },
    {
      id: 'BD5',
      options: [
        { value: 0, text: 'Kendimi suçlu hissetmiyorum.' },
        { value: 1, text: 'Arada bir kendimi suçlu hissettiğim oluyor.' },
        { value: 2, text: 'Kendimi çoğunlukla suçlu hissediyorum.' },
        { value: 3, text: 'Kendimi her an için suçlu hissediyorum.' }
      ]
    },
    {
      id: 'BD6',
      options: [
        { value: 0, text: 'Cezalandırılıyormuşum gibi duygular içinde değilim.' },
        { value: 1, text: 'Sanki bazı şeyler için cezalandırılabilirmişim gibi duygular içindeyim.' },
        { value: 2, text: 'Cezalandırılacakmışım gibi duygular yaşıyorum.' },
        { value: 3, text: 'Bazı şeyler için cezalandırılıyorum.' }
      ]
    },
    {
      id: 'BD7',
      options: [
        { value: 0, text: 'Kendimi hayal kırıklığına uğratmadım.' },
        { value: 1, text: 'Kendimi hayal kırıklığına uğrattım' },
        { value: 2, text: 'Kendimden hiç hoşlanmıyorum.' },
        { value: 3, text: 'Kendimden nefret ediyorum.' }
      ]
    },
    {
      id: 'BD8',
      options: [
        { value: 0, text: 'Kendimi diğer insanlardan daha kötü durumda görmüyorum.' },
        { value: 1, text: 'Kendimi zayıflıklarım ve hatalarım için eleştiriyorum.' },
        { value: 2, text: 'Kendimi hatalarım için her zaman suçluyorum' },
        { value: 3, text: 'Her kötü olayda kendimi suçluyorum.' }
      ]
    },
    {
      id: 'BD9',
      options: [
        { value: 0, text: 'Kendimi öldürmek gibi düşüncelerim yok.' },
        { value: 1, text: 'Bazen, kendimi öldürmeyi düşünüyorum ama böyle bir şeyi yapamam.' },
        { value: 2, text: 'Kendimi öldürebilmeyi çok isterdim.' },
        { value: 3, text: 'Eğer fırsatını bulursam kendimi öldürürüm.' }
      ]
    },
    {
      id: 'BD10',
      options: [
        { value: 0, text: 'Herkesten daha fazla ağladığımı sanmıyorum.' },
        { value: 1, text: 'Eskisine göre şimdilerde daha çok ağlıyorum.' },
        { value: 2, text: 'Şimdilerde her an ağlıyorum.' },
        { value: 3, text: 'Eskiden ağlayabilirdim, şimdilerde istesem de ağlayamıyorum.' }
      ]
    },
    {
      id: 'BD11',
      options: [
        { value: 0, text: 'Eskisine göre daha sinirli veya tedirgin sayılmam.' },
        { value: 1, text: 'Her zamankinden biraz daha fazla tedirginim.' },
        { value: 2, text: 'Çoğu zaman sinirli ve tedirginim.' },
        { value: 3, text: 'Şimdilerde her an için tedirgin ve sinirliyim.' }
      ]
    },
    {
      id: 'BD12',
      options: [
        { value: 0, text: 'Diğer insanlara karşı ilgimi kaybetmedim.' },
        { value: 1, text: 'Eskisine göre insanlarla daha az ilgiliyim.' },
        { value: 2, text: 'Diğer insanlara karşı ilgimin çoğunu kaybettim.' },
        { value: 3, text: 'Diğer insanlara karşı hiç ilgim Kalmadı.' }
      ]
    },
    {
      id: 'BD13',
      options: [
        { value: 0, text: 'Eskisi gibi rahat ve kolay kararlar verebiliyorum.' },
        { value: 1, text: 'Eskisine kıyasla, şimdilerde karar vermeyi daha çok erteliyorum.' },
        { value: 2, text: 'Eskisine göre, karar vermekte oldukça güçlük çekiyorum.' },
        { value: 3, text: 'Artık hiç karar veremiyorum.' }
      ]
    },
    {
      id: 'BD14',
      options: [
        { value: 0, text: 'Eskisinden daha kötü bir dış görünüşüm olduğunu sanmıyorum.' },
        { value: 1, text: 'Sanki yaşlanmış ve çekiciliğimi kaybetmişim gibi düşünüyor ve üzülüyorum.' },
        { value: 2, text: 'Dış görünüşümde artık değiştirilmesi mümkün olmayan ve beni çirkinleştiren değişiklikler olduğunu hissediyorum.' },
        { value: 3, text: 'Çok çirkin olduğumu düşünüyorum.' }
      ]
    },
    {
      id: 'BD15',
      options: [
        { value: 0, text: 'Eskisi kadar iyi çalışabiliyorum.' },
        { value: 1, text: 'Bir işe başlayabilmek için eskisine göre daha fazla çaba harcıyorum.' },
        { value: 2, text: 'Ne iş olursa olsun, yapabilmek için kendimi çok zorluyorum.' },
        { value: 3, text: 'Hiç çalışamıyorum.' }
      ]
    },
    {
      id: 'BD16',
      options: [
        { value: 0, text: 'Eskisi kadar rahat ve kolay uyuyabiliyorum.' },
        { value: 1, text: 'Şimdilerde eskisi kadar kolay ve rahat uyuyamıyorum.' },
        { value: 2, text: 'Eskisine göre 1 veya 2 saat erken uyanıyor ve tekrar uyumakta güçlük çekiyorum.' },
        { value: 3, text: 'Eskisine göre çok erken uyanıyor ve tekrar uyuyamıyorum.' }
      ]
    },
    {
      id: 'BD17',
      options: [
        { value: 0, text: 'Eskisine göre daha çabuk yorulduğumu sanmıyorum.' },
        { value: 1, text: 'Eskisinden daha çabuk ve kolay yoruluyorum.' },
        { value: 2, text: 'Şimdilerde neredeyse her şeyden kolay ve çabuk yoruluyorum.' },
        { value: 3, text: 'Artık hiçbir şey yapamayacak kadar yoruluyorum.' }
      ]
    },
    {
      id: 'BD18',
      options: [
        { value: 0, text: 'İştahım eskisinden pek farklı değil.' },
        { value: 1, text: 'İştahım eskisi kadar iyi değil.' },
        { value: 2, text: 'Şimdilerde iştahım epey kötü.' },
        { value: 3, text: 'Artık hiç iştahım yok.' }
      ]
    },
    {
      id: 'BD19',
      options: [
        { value: 0, text: 'Son zamanlarda pek kilo kaybettiğimi sanmıyorum.' },
        { value: 1, text: 'Son zamanlarda istemediğim halde iki buçuk kilodan fazla kaybettim.' },
        { value: 2, text: 'Son zamanlarda beş kilodan fazla kaybettim.' },
        { value: 3, text: 'Son zamanlarda yedi buçuk kilodan fazla kaybettim.' }
      ]
    },
    {
      id: 'BD20',
      options: [
        { value: 0, text: 'Sağlığım beni pek endişelendirmiyor.' },
        { value: 1, text: 'Son zamanlarda ağrı, sızı, mide bozukluğu, kabızlık gibi sıkıntılarım var.' },
        { value: 2, text: 'Ağrı, sızı gibi bu sıkıntılarım beni epey endişelendirdiği için başka şeyleri düşünmek zor geliyor.' },
        { value: 3, text: 'Bu tür sıkıntılar beni öylesine endişelendiriyor ki, artık başka şeyleri düşünemiyorum.' }
      ]
    },
    {
      id: 'BD21',
      options: [
        { value: 0, text: 'Son zamanlarda cinsel yaşantımda dikkatimi çeken bir şey yok.' },
        { value: 1, text: 'Eskisine göre cinsel konularla daha az ilgileniyorum.' },
        { value: 2, text: 'Şimdilerde cinsellikle pek ilgili değilim.' },
        { value: 3, text: 'Cinsel konulara ilgimi tamamen kaybettim.' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    return getDepressionLevel(score);
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const severityLevel = getDepressionLevel(totalScore);
    
    // Alt ölçek puanlarını hesapla
    const factorScores = {
      umutsuzluk: ['BD1', 'BD2', 'BD4', 'BD9', 'BD11', 'BD12', 'BD13', 'BD15', 'BD17'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      kendineYonelikOlumsuzDuygular: ['BD3', 'BD7'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      bedenselsKaygilar: ['BD14', 'BD20'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      suclulukDuyguları: ['BD5', 'BD6', 'BD8', 'BD13'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0)
    };
    
    // Alt ölçek ortalamalarını hesapla
    const factorAverages = {
      umutsuzluk: factorScores.umutsuzluk / 9,
      kendineYonelikOlumsuzDuygular: factorScores.kendineYonelikOlumsuzDuygular / 2,
      bedenselsKaygilar: factorScores.bedenselsKaygilar / 2,
      suclulukDuyguları: factorScores.suclulukDuyguları / 4
    };
    
    // Risk faktörlerini belirle
    const riskFactors = [];
    if (answers['BD9'] >= 1) {
      riskFactors.push('İntihar düşüncesi');
    }
    
    return {
      score: totalScore,
      severityLevel: severityLevel,
      factorScores: factorScores,
      factorAverages: factorAverages,
      riskFactors: riskFactors,
      requiresTreatment: totalScore >= 17
    };
  }
}; 