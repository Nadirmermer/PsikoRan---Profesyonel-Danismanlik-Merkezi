import { Test } from './types';

export const torontoAleksitimiTest: Test = {
  id: 'toronto-aleksitimi',
  name: 'Toronto Aleksitimi Ölçeği (TAÖ)',
  description: 'Bireylerdeki aleksitimik özellikleri değerlendirmede kullanılan 26 maddelik bir özbildirim aracı.',
  instructions: 'Lütfen aşağıdaki ifadeleri dikkatle okuyup sizin duygu ve düşüncelerinize hangi derecede uygun olduğunu işaretleyiniz.',
  infoText: 'Toronto Aleksitimi Ölçeği, bireylerin duygularını tanıma, ifade etme ve dışa yönelimli düşünme eğilimlerini değerlendirmek için tasarlanmış bir ölçektir. Taylor, Ryan ve Bagby tarafından Toronto Alexithymia Scale ismi ile geliştirilen ölçeği Dereboy 1990 yılında Türkçeye uyarlamış, ölçeğin tekrar gözden geçirilmesi ise Motan ve Gençöz tarafından 2007 yılında yapılmıştır. Ölçeğin iç tutarlığı 0.79, test tekrar test güvenirliği ise 0.67 olarak bulunmuştur. Ölçeğin 41 maddelik ilk formdan istatistiksel olarak kriterleri karşılamayan 15 madde silinmiştir. 26 maddeden oluşan ölçek, beşli Likert tipi cevaplamayı içeren bir özbildirim aracı olarak kullanılmaktadır. Ölçeğin alt boyutları ve madde sayıları sırasıyla şöyledir: Duygu iletişiminde zorluk (8 madde), duyguları tanıma ve tanımlamada zorluk (8 madde), hayal kurmaktan yoksun olma (6 madde). Toplamda 61 ve üzerindeki değerler aleksitimiyi, 51-60 arasındaki değerler sınırda aleksitimiyi göstermektedir. 50 ve altındaki değerler normal olarak kabul edilmektedir.',
  reference: 'Taylor, Ryan ve Bagby; Türkçe uyarlama: Dereboy (1990), Motan ve Gençöz (2007)',
  questions: [
    {
      id: 'q1',
      text: 'Ağladığımda, beni ağlatan şeyin ne olduğunu bilirim.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q2',
      text: 'Hayal kurmak boşa zaman harcamaktır.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q3',
      text: 'Keşke bu kadar utangaç olmasaydım.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q4',
      text: 'Çoğu zaman duygularımın ne olduğunu tam olarak bilemem.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q5',
      text: 'Gelecek hakkında sıkça hayal kurarım.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q6',
      text: 'Birçokları kadar kolay arkadaş edinebildiğimi sanıyorum.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q7',
      text: 'Bir sorunun çözümünü bilmek, o çözüme nasıl ulaşıldığını bilmekten daha önemlidir.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q8',
      text: 'Duygularımı tam olarak anlatacak sözleri bulmak benim için zordur.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q9',
      text: 'Herhangi bir olay hakkındaki görüşümü başkalarına açıkça belirtmekten hoşlanırım.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q10',
      text: 'Bedenimde öyle şeyler hissediyorum ki; doktorlar bile ne olduğunu anlamıyorlar.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q11',
      text: 'Benim için, yalnızca bir işin yapılmış olması yetmez; nasıl ve neden yapıldığını bilmek isterim.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q12',
      text: 'Duygularımı kolayca anlatabilirim.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q13',
      text: 'Sorunların ne olduğu üzerinde değil; onların nereden kaynaklandığı üzerine düşünmeyi tercih ederim.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q14',
      text: 'Sinirim bozuk olduğunda; üzüntülü mü, korkulu mu, yoksa öfkeli mi olduğumu bilmem.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q15',
      text: 'Hayal gücümü bolca kullanırım.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q16',
      text: 'Yapacak başka bir işim olmadığında, zamanımın çoğunu hayal kurarak geçiririm.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q17',
      text: 'Bedenimde şaşırtıcı hisler duyduğum olur.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q18',
      text: 'Pek hayal kurmam.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q19',
      text: 'Olayların nedenine kafa yormaktan çok işleri oluruna bırakmayı tercih ederim.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q20',
      text: 'Tam olarak tanımlayamadığım duygularım var.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q21',
      text: 'İnsanın duygularına yakın olması önemlidir.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q22',
      text: 'İnsanlar hakkında neler hissettiğimi anlatmak benim için zordur.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q23',
      text: 'Tanıdıklarım, duygularımdan daha çok söz etmemi isterler.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q24',
      text: 'İnsan, olayların derinine inmelidir.',
      options: [
        { value: 5, text: 'Kesinlikle Uygun Değil' },
        { value: 4, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 2, text: 'Oldukça Uygun' },
        { value: 1, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q25',
      text: 'İçimde neler olup bittiğini bilmiyorum.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    },
    {
      id: 'q26',
      text: 'Çoğu zaman kızgınlığımın farkına varmam.',
      options: [
        { value: 1, text: 'Kesinlikle Uygun Değil' },
        { value: 2, text: 'Biraz Uygun' },
        { value: 3, text: 'Uygun' },
        { value: 4, text: 'Oldukça Uygun' },
        { value: 5, text: 'Kesinlikle Uygun' }
      ]
    }
  ],
  calculateScore: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    return totalScore;
  },
  interpretScore: (score) => {
    if (score <= 50) {
      return 'Normal';
    } else if (score >= 51 && score <= 60) {
      return 'Sınırda aleksitimi';
    } else {
      return 'Aleksitimi';
    }
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    
    let severityLevel = '';
    if (totalScore <= 50) {
      severityLevel = 'Normal';
    } else if (totalScore >= 51 && totalScore <= 60) {
      severityLevel = 'Sınırda aleksitimi';
    } else {
      severityLevel = 'Aleksitimi';
    }
    
    return {
      score: totalScore,
      factorAverages: {},
      severityLevel: severityLevel,
      requiresTreatment: totalScore > 60,
      riskFactors: []
    };
  }
}; 