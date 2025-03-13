import { Test, Module } from './types';

// Test başlangıç açıklaması
export const scid5SpqIntro = `
SCID-5-SPQ (DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları için Tarama Anketi), 
kişilik bozukluklarının varlığını taramak için kullanılan bir öz bildirim anketidir.

Bu anket, SCID-5-PD görüşmesi öncesinde kişilik bozukluğu özelliklerini taramak için kullanılır.
Hastalar tarafından doldurulabilir, ancak sonuçların ruh sağlığı uzmanı tarafından değerlendirilmesi gerekir.

Test modüler yapıdadır. İstediğiniz kişilik bozukluğu modüllerini seçerek değerlendirme yapabilirsiniz.
`;

// Puanlama kriterleri ve açıklamalar
export const scid5SpqCriteria = {
  personalityDisorders: {
    avoidant: { name: 'Çekingen Kişilik Bozukluğu', description: 'Sosyal inhibisyon, yetersizlik duyguları ve olumsuz değerlendirilmeye karşı aşırı duyarlılık' },
    dependent: { name: 'Bağımlı Kişilik Bozukluğu', description: 'Bakım alma ihtiyacına bağlı olarak aşırı bağımlı ve boyun eğici davranışlar' },
    obsessiveCompulsive: { name: 'Takıntılı-Zorlantılı Kişilik Bozukluğu', description: 'Düzen, mükemmeliyetçilik ve zihinsel/kişilerarası kontrol ile aşırı uğraş' },
    paranoid: { name: 'Paranoid Kişilik Bozukluğu', description: 'Başkalarının niyetlerinden şüphelenme ve yaygın güvensizlik' },
    schizotypal: { name: 'Şizotipal Kişilik Bozukluğu', description: 'Yakın ilişkilerde rahatsızlık, bilişsel/algısal çarpıklıklar ve eksantrik davranışlar' },
    schizoid: { name: 'Şizoid Kişilik Bozukluğu', description: 'Sosyal ilişkilerden kopukluk ve kısıtlı duygusal ifade' },
    histrionic: { name: 'Histriyonik Kişilik Bozukluğu', description: 'Aşırı duygusallık ve ilgi arama davranışı' },
    narcissistic: { name: 'Narsisistik Kişilik Bozukluğu', description: 'Büyüklenmecilik, hayranlık ihtiyacı ve empati eksikliği' },
    borderline: { name: 'Sınırda Kişilik Bozukluğu', description: 'İlişkilerde, benlik algısında ve duygulanımda istikrarsızlık ve belirgin dürtüsellik' },
    antisocial: { name: 'Antisosyal Kişilik Bozukluğu', description: 'Başkalarının haklarını hiçe sayma ve ihlal etme' }
  },
  cutoffScores: {
    avoidant: 4,
    dependent: 5,
    obsessiveCompulsive: 4,
    paranoid: 4,
    schizotypal: 5,
    schizoid: 4,
    histrionic: 5,
    narcissistic: 5,
    borderline: 5,
    antisocial: 3
  },
  notes: [
    'SCID-5-SPQ, kişilik bozukluklarını taramak için kullanılan bir öz bildirim anketidir.',
    'Her madde için "Evet", "Hayır" veya "Bilmiyorum" şeklinde cevap verilir.',
    'Her kişilik bozukluğu için belirli bir kesme puanı vardır.',
    'Kesme puanını aşan kişilik bozuklukları için SCID-5-PD görüşmesi yapılması önerilir.',
    'Bu anket tanı koymak için değil, tarama amaçlı kullanılır.',
    'Test modüler yapıdadır. İstediğiniz kişilik bozukluğu modüllerini seçerek değerlendirme yapabilirsiniz.'
  ]
};

// SCID-5-SPQ modülleri (her kişilik bozukluğu bir modül)
export const scid5SpqModules: Module[] = [
  {
    id: 'avoidant',
    name: 'Çekingen Kişilik Bozukluğu',
    description: 'Sosyal inhibisyon, yetersizlik duyguları ve olumsuz değerlendirilmeye karşı aşırı duyarlılık',
    questions: ['SPQ1', 'SPQ2', 'SPQ3', 'SPQ4', 'SPQ5', 'SPQ6', 'SPQ7']
  },
  {
    id: 'dependent',
    name: 'Bağımlı Kişilik Bozukluğu',
    description: 'Bakım alma ihtiyacına bağlı olarak aşırı bağımlı ve boyun eğici davranışlar',
    questions: ['SPQ8', 'SPQ9', 'SPQ10', 'SPQ11', 'SPQ12', 'SPQ13', 'SPQ14', 'SPQ15']
  },
  {
    id: 'obsessiveCompulsive',
    name: 'Takıntılı-Zorlantılı Kişilik Bozukluğu',
    description: 'Düzen, mükemmeliyetçilik ve zihinsel/kişilerarası kontrol ile aşırı uğraş',
    questions: ['SPQ16', 'SPQ17', 'SPQ18', 'SPQ19', 'SPQ20', 'SPQ21', 'SPQ22', 'SPQ23', 'SPQ24']
  },
  {
    id: 'paranoid',
    name: 'Kuşkucu (Paranoid) Kişilik Bozukluğu',
    description: 'Başkalarının niyetlerinden şüphelenme ve yaygın güvensizlik',
    questions: ['SPQ25', 'SPQ26', 'SPQ27', 'SPQ28', 'SPQ29', 'SPQ30', 'SPQ31', 'SPQ32']
  },
  {
    id: 'schizotypal',
    name: 'Şizotipal (Şizotürü) Kişilik Bozukluğu',
    description: 'Yakın ilişkilerde rahatsızlık, bilişsel/algısal çarpıklıklar ve eksantrik davranışlar',
    questions: ['SPQ33', 'SPQ34', 'SPQ35', 'SPQ36', 'SPQ37', 'SPQ38', 'SPQ39', 'SPQ40', 'SPQ41', 'SPQ42', 'SPQ43', 'SPQ44', 'SPQ45']
  },
  {
    id: 'schizoid',
    name: 'Şizoid (Şizogibi) Kişilik Bozukluğu',
    description: 'Sosyal ilişkilerden kopukluk ve kısıtlı duygusal ifade',
    questions: ['SPQ46', 'SPQ47', 'SPQ48', 'SPQ49', 'SPQ50', 'SPQ51']
  },
  {
    id: 'histrionic',
    name: 'Histriyonik Kişilik Bozukluğu',
    description: 'Aşırı duygusallık ve ilgi arama davranışı',
    questions: ['SPQ52', 'SPQ53', 'SPQ54', 'SPQ55', 'SPQ56', 'SPQ57', 'SPQ58', 'SPQ59']
  },
  {
    id: 'narcissistic',
    name: 'Özsever (Narsisistik) Kişilik Bozukluğu',
    description: 'Büyüklenmecilik, hayranlık ihtiyacı ve empati eksikliği',
    questions: ['SPQ60', 'SPQ61', 'SPQ62', 'SPQ63', 'SPQ64', 'SPQ65', 'SPQ66', 'SPQ67', 'SPQ68', 'SPQ69', 'SPQ70', 'SPQ71', 'SPQ72', 'SPQ73', 'SPQ74', 'SPQ75', 'SPQ76']
  },
  {
    id: 'borderline',
    name: 'Sınırda Kişilik Bozukluğu',
    description: 'İlişkilerde, benlik algısında ve duygulanımda istikrarsızlık ve belirgin dürtüsellik',
    questions: ['SPQ77', 'SPQ78', 'SPQ79', 'SPQ80', 'SPQ81', 'SPQ82', 'SPQ83', 'SPQ84', 'SPQ85', 'SPQ86', 'SPQ87', 'SPQ88', 'SPQ89', 'SPQ90', 'SPQ91']
  },
  {
    id: 'antisocial',
    name: 'Antisosyal Kişilik Bozukluğu',
    description: 'Başkalarının haklarını hiçe sayma ve ihlal etme',
    questions: ['SPQ92', 'SPQ93', 'SPQ94', 'SPQ95', 'SPQ96', 'SPQ97', 'SPQ98', 'SPQ99', 'SPQ100', 'SPQ101', 'SPQ102', 'SPQ103', 'SPQ104', 'SPQ105', 'SPQ106']
  }
];

export const scid5SpqTest: Test = {
  id: 'scid-5-spq',
  name: 'SCID-5-SPQ (DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları için Tarama Anketi)',
  description: scid5SpqIntro,
  infoText: 'Bu anket, kişilik bozukluklarını taramak için kullanılır. Her madde için kendinize en uygun cevabı (Evet, Hayır veya Bilmiyorum) seçiniz. İstediğiniz kişilik bozukluğu modüllerini seçerek değerlendirme yapabilirsiniz.',
  isModular: true,
  modules: scid5SpqModules,
  
  // SCID-5-SPQ'da her kişilik bozukluğu için örnek sorular (gerçek ankette çok daha fazla soru vardır)
  questions: [
    {
      id: 'SPQ1',
      text: 'Çok insanla uğraşmanızı gerekdirecek işlerden ya da görevlerden kaçınıyor musunuz?',
      moduleId: 'avoidant',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ2',
      text: 'Sizi seveceklernden emin olmadıkça insanlarla arkadaşlık kurmakdan kaçınıyor musunuz?',
      moduleId: 'avoidant',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ3',
      text: 'Yakın olduğunuz insanlara bile "açık" olmakta güçlük çeker misiniz?',
      moduleId: 'avoidant',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ4',
      text: 'Toplumsal durumlarda eleştirleceğinizden ya da dışlanacağınızdan sık sık kaygılandığınız olur mu?',
      moduleId: 'avoidant',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ5',
      text: 'Yeni insanlarla karşılaştığınızda genellikle sessiz mi kalırınız?',
      moduleId: 'avoidant',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ6',
      text: 'Çoğu başka insan denli iyi, akıllı ya da çekici olmadığınızı mı düşünüyorsunuz?',
      moduleId: 'avoidant',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ7',
      text: 'Güçlükle yapılabilecek ya da yeni bir seyin denenmesini gerektirebilecek işleri yapmaktan korkar mısınız?',
      moduleId: 'avoidant',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ8',
      text: 'Başkalarından öğüt ya da güvence almadıkca, ne giyeceğiniz ya da restoranda ne ısmarlayacağınız gibi konularda, gündelik kararlarınızı vermekte güçlük çeker misiniz?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ9',
      text: 'Parasal durum, çocuk bakımı ya da yaşam düzenlemeler gibi, yaşamınızın önemli alanlarını yönelirken başkalarına bağımlı mısınız?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ10',
      text: 'Düşüncelerinin yanlış olduğunu bilmenize karşın insanlara katılmamakta güçlük çeker misiniz?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ11',
      text: 'Bir tasarıyı başlatmakta ya da kendi başınıza bir iş yapmakta güçlük çeker misiniz?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ12',
      text: 'Başkalarının sizinle ilgilenmesinin, sizin için önemli olmasından ötürü, onlar için, hoşa gitmeyecek ya da mantıksz işler yapmaya istekli olur musunuz?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ13',
      text: 'Kendi başınıza kaldığınızda genellikle rahatsızlık duyar mısınız?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ14',
      text: 'Yakın bir ilişkiniz sonlandığında, sizinle ilgilensin diye, hemen bir başkasını bulma arayışına girme gereği duyar mısınız?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ15',
      text: 'Kendinize bakmak için yalnız bırakılmaktan ötürü çok kaygı duyar mısınız?',
      moduleId: 'dependent',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ16',
      text: 'Ayrıntılara, düzene ya da düzenlemeye ya da tasarlamaya odaklanmakla çok zaman harcayan biri misiniz?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ17',
      text: 'Tam doğru olmasına çabalamanızdan ötürü çok zaman harcadığınız için işleri bitirmekte güçlük çeker misiniz?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ18',
      text: 'İşinize ya da üretken olmaya çok düşkün biri misiniz?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ19',
      text: 'Neyin doğru, neyin yanlış olduğuna ilişkin çok yüksek değerleriniz var mı?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ20',
      text: 'Bir gün işe yarayacağını düşünmenizden ötürü elinizdekileri elden çıkarmakta güçlük çeker misiniz?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ21',
      text: 'Başka insanlarla birlikte çalışmakta ya da tam sizin istediğiniz gibi yapmaları konusunda aranızda bir uzlaşma olmadıkça, başkalarından bir iş istemekte güçlük çeker misiniz?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ22',
      text: 'Kendiniz ya da başkaları için para harcamakta güçlük çeker misiniz?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ23',
      text: 'Bir kez tasarlamışsanız, yaptığınız tasarıda değişiklik yapmakta güçlük çeker misiniz?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ24',
      text: 'İnsanlar, sizin direngen (inatçı) olduğunuzu söylediler mi?',
      moduleId: 'obsessiveCompulsive',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ25',
      text: 'İnsanların, sizi kullandığı, sizi kırdığı ya da size yalan söylediği izlenimine sık sık kapıldığınız olur mu?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ26',
      text: 'Başkalarına çok az güvenen, çok kendine dönük bir insan mısınız?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ27',
      text: 'Size karşı kullanabilecekleri için, insanların sizinle ilgili olarak çok bilgi sahibi olmamalarının en iyisi olduğunu mu düşünüyorsunuz?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ28',
      text: 'insanların söyledikleri ya da yaptıklarıyla sizin gözünüzü korkuttukları ya da sizi aşağıladıkları izlenimine sık sık kapıldığınız olur mu?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ29',
      text: 'Aşağılayan ya da küçümseyen insanları bağışlaması çok zaman alan ya da öç alma duygusunu sürdüren biri misiniz?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ30',
      text: 'Çok zaman önce, size yaptıklan ya da söyledikleri bir şey için bağışlayamadığınız çok sayıda insan var mı?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ31',
      text: 'Biri sizi eleştirdiğinde ya da aşağıladığında, sık sık, öfkelendiğiniz ya da karşı saldında bulunduğunuz olur mu?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ32',
      text: 'Zaman zaman, eşinizin ya da sevgilinizin sizi aldattığından kuşkulandığınız oldu mu?',
      moduleId: 'paranoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ33',
      text: 'Toplum içinde insanlan konuşurken gördüğünüzde, sanki sizi konuşuyorlarmış gibi bir izlenimine sık sık kapıldığınız olur mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ34',
      text: 'Çevrenizde insan varken, size bakıldığı ya da gözlerin sizin üzerinizde olduğu izlenimine sık sık kapıldığınız olur mu',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ35',
      text: 'Şarkı sözlerinin bir filmde ya da televizyonda geçen bir olayın size özel bir anlamının olduğu izlenimine sık sık kapıldığınız olur mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ36',
      text: 'Batıl (gerçeğe uymayan) inançları olan biri misiniz?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ37',
      text: 'Yalnızca dileyerek ya da üzerinde düşünerek birtakım olayların olmasını sağlayabildiğinizi düşündüğünüz hiç oldu mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ38',
      text: 'Doğaüstü kişisel yaşantılarınız oldu mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ39',
      text: 'Olaylan bilebilmenizi ya da öngörebilmenizi sağlayan bir "altıncı his"siniz (ōnsezileriniz) olduğuna inanıyor musunuz?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ40',
      text: 'Çevrenizdeki her şeyin gerçekdışı olduğu, vücudunuzdan ya da zihninizdenkoptuğunuz ya da kendi düşüncelerinize ya da davranışlarınıza dışarıdan bir gözlemci gibi baktığınız izlenimine sık sık kapıldığınız olur mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ41',
      text: 'Başka insanların göremediği şeyleri sık sık gördüğünüz olur mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ42',
      text: 'Yumuşakça adınızı söyleyen bir sesi sık sık duyduğunuz olur mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ43',
      text: 'Hiç kimseyi görmemenize karşın, çevrenizde bir kişi ya da bir güç olduğu hissine kapıldığınız oldu mu?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ44',
      text: 'Yakın aile bireyleri dışında, gerçekten yakın olduğunuz insan sayısı çok az mı?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ45',
      text: 'Çok iyi tanımadığınız insanların yanındayken genellikle kendinizi gergin mi hissedersiniz?',
      moduleId: 'schizotypal',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ46',
      text: 'Arkadaşlarınız, sevgiliniz ya da allenizle bir arada olmak sizin için önemli DEĞİL mi?',
      moduleId: 'schizoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ47',
      text: 'İşleri, başka İnsanlarla birlikte yapmaktansa tek başınıza yapmayı, neredeyse her zaman yeğler misiniz?',
      moduleId: 'schizoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ48',
      text: 'Bir başkasıyla cinsel yaşantınız olmasıyla ilgilenmiyor ya da çok az ilgileniyor musunuz?',
      moduleId: 'schizoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ49',
      text: 'Size zevk veren gerçekten çok az şey mi var?',
      moduleId: 'schizoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ50',
      text: 'İnsanların sizinle ilgili olarak ne düşündüklerinin bir önemi var mı?',
      moduleId: 'schizoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ51',
      text: 'Çok kızgın ya da sevinçli olmak gibi güçlü duyguları çok seyrek ml yaşarsınız?',
      moduleId: 'schizoid',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ52',
      text: 'İlgi odağı olmayı sever misiniz?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ53',
      text: 'Kırıştırmaya (flört etmeye) çok eğilimli misiniz?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ54',
      text: 'Sık sık başkalarına asıldığınız olur mu?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ55',
      text: 'Giyiminizle ya da görüntünüzle ilgiyi üzerinize çekmeyi sever misiniz?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ56',
      text: 'Davranışlarınız ve konuşmanız çok çarpıcı (duyguları kamçılayıcı) mıdır?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ57',
      text: 'Çoğu başka insandan daha duygusal mısınız, sözgelimi üzücü bir öykü duyduğunuzda hıçkırarak ağlar mısınız?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ58',
      text: 'Birlikte olduğunuz insanlara, televizyonda gördüklerinize ya da yeni okuduklarınıza göre, olaylara karşı görüşünüzü sık sık değiştirir misiniz?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ59',
      text: 'Evin su donanımını onaran, arabanızın bakımını yapan ya da doktorunuz gibi size hizmet veren kişileri bile İyi birer arkadaşınız olarak görür müsünüz?',
      moduleId: 'histrionic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ60',
      text: 'Çoğu başka Insandan daha önemli, daha yetenekli ya da daha başarılı mısınız?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ61',
      text: 'İnsanlar, size kendinizi beğenmiş biri olduğunuzu söylediler mi?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ62',
      text: 'Bir gün çok güçlü başarılı ya da tanınmış biri olacağınızı çok düşünüyor musunuz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ63',
      text: 'Bir gün çok büyük bir aşk yaşacağınızı çok düşünüyor musunuz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ64',
      text: 'Bir sorununuz olduğu her zaman, en tepedeki kişiyi görmek için diretir misiniz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ65',
      text: 'Önemli ya da etkili insanlarla zaman geçirmeye çalışır mısınız?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ66',
      text: 'İnsanların size ilgi göstermesi ya da sizi çok beğenmesi, sizin için önemli midir?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ67',
      text: 'Özel davranılmayı gerektiren ya da her ne istiyorsanız, başkalarının onu hiç düşünmeden yapması gerektiğini düşünen biri misiniz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ68',
      text: 'Sık sık, kendi gereksinmelerinizi başkalarının gereksinmelerinin önüne çeker misiniz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ69',
      text: 'İnsanları kullandığınızdan yakınınlar oldu mu?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ70',
      text: 'Genelde, başka insanların gereksinmelerinin ya da duygularının gerçekten sizin bir sorununuz olmadığını mı düşünürsünüz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ71',
      text: 'Başkalarının sorunlarını sıkıcı mı bulursunuz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ72',
      text: 'İnsanların sizin kendilerini dinlemediğinizden ya da onların duygularına aldırmadığınızdan yakındıkları oldu mu?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ73',
      text: 'Başarılı birilerini gördüğünüzde bunu o kişilerden çok sizin hak ettiğinizi düşündüğünüz olur mu?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ74',
      text: 'Sık sık, başkalarının sizi kıskandığını düşünür müsünüz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ75',
      text: 'Sizin zaman harcamanıza ya da ilgi göstermenize değer çok az sayıda insan olduğu düşüncesinde misiniz?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ76',
      text: 'İnsanların, çok büyüklendiğinizden ve kasıldığınızdan ya da bilgiçlik tasladığınızdan yakındıkları oldu mu?',
      moduleId: 'narcissistic',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ77',
      text: 'Değer verdiğiniz birinin sizden uzaklaşacak gibi olduğunu düşündüğünüzde çılgına döndüğünüz oldu mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ78',
      text: 'Önemsediğiniz insanlarla olan ilişkilerinizde çok iniş çıkışlar yaşar mısınız?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ79',
      text: 'Nasıl biri olduğunuzla ilgili düşünceleriniz, sık sık, çok değişir mi?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ80',
      text: 'Değişik insanlarla ya da değişik durumlarda değişik biri olup, kimi zaman gerçekten kim olduğunuzu bilemediğiniz zamanlar olur mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ81',
      text: 'Amaçlarınızda, işle ilgili tasarılarınızda, dinsel görüşlerinizde ve diğer alanlarda, birden, keskin birtakım değişiklikler yaptığınız çok oldu mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ82',
      text: 'Arkadaşlarınızın türünde ya da cinsel kimliğinizde, birden, keskin birtakım değişiklikler yaptığınız oldu mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ83',
      text: 'Sık sık dürtüsel (sonuçlarını düşünmeden) davrandığınız olur mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ84',
      text: 'Kendinizi yaralamaya ya da öldürmeye kalkıştığınız ya da kalkışmakla başkalarının gözünü korkuttuğunuz oldu mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ85',
      text: 'Tasarlayarak kendinizi kestiğiniz, yaktığınız ya da tırmaladığınız hiç oldu mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ86',
      text: 'Duygusal durumunuz, sık sık, yaşamınızda ne olup bittiğine bağlı olarak, bir gün içinde çok değişir mi?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ87',
      text: 'Sıklıkla içinizde bir boşluk hisseder misiniz?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ88',
      text: 'Sık sık öfke patlamalarınız ya da özdenetiminizi yitirecek denli öfkelendiğiniz olur mu?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ89',
      text: 'Kızdığınızda insanlara vurur musunuz ya da üzerlerine bir şey atar mısınız?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ90',
      text: 'Ufak şeyler sizi çok kızdırır mı?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ91',
      text: 'Altüst olduğunuzda insanlardan kuşkulanır mısınız ya da kendinizi bedeninizden kopmuş olarak ya da çevrenizdeki nesneleri gerçek dışı olarak hisseder misiniz?',
      moduleId: 'borderline',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ92',
      text: '15 yaşınızdan önce diğer çocuklara kabadayılık taslar mıydınız onlara gözdağı verir miydiniz ya da onları korkutur muydunuz?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ93',
      text: '15 yaşınızdan önce, kavga dövüş başlatır mıydınız?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ94',
      text: '15 yaşınızdan önce, birini sopa, taş kırık şişe, bıçak ya da tabanca gibi bir nesneyle yaraladınız mı ya da yaralamakla gözünü korkuttuğunuz oldu mu?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ95',
      text: '15 yaşınızdan önce, birine acı çektirecek acımasız birtakım davranışlarınız oldu mu?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ96',
      text: '15 yaşınızdan önce tasarlayarak hayvanlara acı çektirdiğiniz oldu mu?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ97',
      text: '15 yaşınızdan önce, birinin gözünü korkutarak elinden zorla bir şey aldınız mı, birine saldırıp soydunuz mu ya da hırsızlık yaptınız mı?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ98',
      text: '15 yaşınızdan önce, birini, cinsel bir eylemde bulunmak için zorladığınız oldu mu?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ99',
      text: '15 yaşınızdan önce, yangın çıkardınız mı?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ100',
      text: '15 yaşınızdan önce, sizin olmayan nesnelere bilerek zarar verdiğiniz oldu mu?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ101',
      text: '15 yaşınızdan önce, evlere, diğer yapılara ya da arabalara zorla girdiğiniz oldu mu?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ102',
      text: '15 yaşınızdan önce, istediğiniz bir şeyi elde etmek ya da bir şeyi yapmaktan kurtulmak için başkalarına çok yalan söylediniz mi ya da onları kandırdınız mı?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ103',
      text: '15 yaşınızdan önce, zaman zaman mağazalardan hırsızlık yaptınız mı, bir şey çaldınız mı ya da para için başkasının imzasını attınız mı?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ104',
      text: '15 yaşınızdan önce, evden kaçtınız mı ve geceyi dışanda geçirdiniz mi?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ105',
      text: '13 yaşınızdan önce, sıklıkla, evde olmanızın beklendiği saatlerden çok sonrasına, çok geç saatlere dek dışarıda kaldığınız oldu mu?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ106',
      text: '13 yaşınızdan önce, sık sık okuldan kaçar mıydınız?',
      moduleId: 'antisocial',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    }
  ],

  // Puanlama fonksiyonu
  calculateScore: (answers: Record<string, number>) => {
    // Toplam "Evet" cevaplarının sayısını hesapla
    return Object.values(answers).filter(value => value === 1).length;
  },

  // Puanı yorumlama fonksiyonu
  interpretScore: (score: number) => {
    return `Toplam ${score} madde için "Evet" cevabı verilmiştir. Detaylı değerlendirme için kişilik bozukluğu bazında puanlar incelenmelidir.`;
  },

  // Rapor oluşturma fonksiyonu
  generateReport: (answers: Record<string, number>) => {
    // Kişilik bozukluğu bazında "Evet" cevaplarının sayısını hesapla
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
    
    // Kişilik bozukluğu bazında "Hayır" cevaplarının sayısını hesapla
    const pdNoScores: Record<string, number> = {
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
    
    // Kişilik bozukluğu bazında "Bilmiyorum" cevaplarının sayısını hesapla
    const pdUnknownCounts: Record<string, number> = {
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
    
    // Kişilik bozukluğu bazında toplam soru sayısını hesapla
    const pdTotalQuestions: Record<string, number> = {
      avoidant: 7,
      dependent: 8,
      obsessiveCompulsive: 9,
      paranoid: 8,
      schizotypal: 13,
      schizoid: 6,
      histrionic: 8,
      narcissistic: 17,
      borderline: 15,
      antisocial: 15
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
    
    const pdUnknowns: Record<string, string[]> = {
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
    
    // Hangi modüllerin çözüldüğünü takip et
    const solvedModules: string[] = [];
    
    Object.entries(answers).forEach(([key, value]) => {
      let pdType = '';
      
      if (key.startsWith('SPQ') && parseInt(key.substring(3)) <= 7) pdType = 'avoidant';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 8 && parseInt(key.substring(3)) <= 15) pdType = 'dependent';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 16 && parseInt(key.substring(3)) <= 24) pdType = 'obsessiveCompulsive';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 25 && parseInt(key.substring(3)) <= 32) pdType = 'paranoid';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 33 && parseInt(key.substring(3)) <= 45) pdType = 'schizotypal';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 46 && parseInt(key.substring(3)) <= 51) pdType = 'schizoid';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 52 && parseInt(key.substring(3)) <= 59) pdType = 'histrionic';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 60 && parseInt(key.substring(3)) <= 76) pdType = 'narcissistic';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 77 && parseInt(key.substring(3)) <= 91) pdType = 'borderline';
      else if (key.startsWith('SPQ') && parseInt(key.substring(3)) >= 92 && parseInt(key.substring(3)) <= 106) pdType = 'antisocial';
      
      if (pdType) {
        // Modülün çözüldüğünü işaretle
        if (!solvedModules.includes(pdType)) {
          solvedModules.push(pdType);
        }
        
        const question = scid5SpqTest.questions.find(q => q.id === key);
        
        if (value === 1) { // Evet
          pdScores[pdType]++;
          if (question) {
            pdPositives[pdType].push(question.text || key);
          }
        } else if (value === 2) { // Bilmiyorum
          pdUnknownCounts[pdType]++;
          if (question) {
            pdUnknowns[pdType].push(question.text || key);
          }
        } else if (value === 0) { // Hayır
          pdNoScores[pdType]++;
        }
      }
    });

    // Toplam "Evet" cevaplarının sayısı
    const totalYesAnswers = Object.values(pdScores).reduce((sum, score) => sum + score, 0);
    
    // Toplam "Hayır" cevaplarının sayısı
    const totalNoAnswers = Object.values(pdNoScores).reduce((sum, score) => sum + score, 0);
    
    // Toplam "Bilmiyorum" cevaplarının sayısı
    const totalUnknownAnswers = Object.values(pdUnknownCounts).reduce((sum, count) => sum + count, 0);
    
    // Sütun grafiği için veri hazırla
    const chartData = {
      labels: solvedModules.map(moduleId => {
        const module = scid5SpqModules.find(m => m.id === moduleId);
        return module ? module.name : moduleId;
      }),
      datasets: [
        {
          label: 'Evet',
          data: solvedModules.map(moduleId => pdScores[moduleId]),
          backgroundColor: { r: 39, g: 124, b: 98 } // Yeşil
        },
        {
          label: 'Hayır',
          data: solvedModules.map(moduleId => pdNoScores[moduleId]),
          backgroundColor: { r: 155, g: 34, b: 34 } // Kırmızı
        },
        {
          label: 'Bilmiyorum',
          data: solvedModules.map(moduleId => pdUnknownCounts[moduleId]),
          backgroundColor: { r: 150, g: 150, b: 150 } // Gri
        }
      ]
    };
    
    // Her modül için pasta grafiği verileri
    const pieChartData = solvedModules.map(moduleId => {
      const module = scid5SpqModules.find(m => m.id === moduleId);
      return {
        moduleName: module ? module.name : moduleId,
        data: [pdScores[moduleId], pdNoScores[moduleId], pdUnknownCounts[moduleId]],
        colors: [
          { r: 39, g: 124, b: 98 }, // Yeşil
          { r: 155, g: 34, b: 34 }, // Kırmızı
          { r: 150, g: 150, b: 150 } // Gri
        ]
      };
    });
    
    // Modül bilgilerini hazırla
    const moduleInfo = solvedModules.map(moduleId => {
      const module = scid5SpqModules.find(m => m.id === moduleId);
      const yesCount = pdScores[moduleId];
      const noCount = pdNoScores[moduleId];
      const unknownCount = pdUnknownCounts[moduleId];
      const totalQuestions = pdTotalQuestions[moduleId];
      
      // Yüzdelik hesapla
      const yesPercentage = (yesCount / totalQuestions) * 100;
      const noPercentage = (noCount / totalQuestions) * 100;
      const unknownPercentage = (unknownCount / totalQuestions) * 100;
      
      return {
        id: moduleId,
        name: module?.name || moduleId,
        description: module?.description || '',
        yesCount: yesCount,
        noCount: noCount,
        unknownCount: unknownCount,
        totalQuestions: totalQuestions,
        yesPercentage: yesPercentage.toFixed(1),
        noPercentage: noPercentage.toFixed(1),
        unknownPercentage: unknownPercentage.toFixed(1)
      };
    });
    
    // TestReport tipine uygun olması için factorAverages hesapla
    const factorAverages = Object.entries(pdScores).reduce((acc, [key, value]) => {
      const totalQuestions = pdTotalQuestions[key];
      acc[key] = totalQuestions > 0 ? value / totalQuestions : 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      score: totalYesAnswers, // TestReport tipine uygun olması için score alanı eklendi
      totalScore: totalYesAnswers, // Toplam puan yerine toplam "Evet" sayısı
      totalNoAnswers: totalNoAnswers,
      totalUnknownAnswers: totalUnknownAnswers,
      // TestReport tipine uygun olması için gerekli alanlar
      severityLevel: 'Değerlendirme', // Sabit bir değer, çünkü SCID-5-SPQ için şiddet seviyesi kullanılmıyor
      requiresTreatment: false, // Sabit bir değer, çünkü SCID-5-SPQ için tedavi gerekliliği doğrudan belirlenmiyor
      factorScores: pdScores, // Kişilik bozukluğu bazında "Evet" sayıları
      factorAverages: factorAverages, // TestReport tipine uygun olması için eklendi
      factorNoScores: pdNoScores, // Kişilik bozukluğu bazında "Hayır" sayıları
      factorUnknownCounts: pdUnknownCounts, // Kişilik bozukluğu bazında "Bilmiyorum" sayıları
      factorTotalQuestions: pdTotalQuestions, // Kişilik bozukluğu bazında toplam soru sayıları
      riskFactors: [], // TestReport tipine uygun olması için boş bir dizi eklendi
      prominentSymptoms: Object.entries(answers)
        .filter(([_, value]) => value === 1)
        .map(([key]) => {
          const question = scid5SpqTest.questions.find(q => q.id === key);
          return {
            question: parseInt(key.substring(3)) || 0,
            severity: 1,
            response: question?.text || key
          };
        }),
      interpretation: {
        overall: `SCID-5-SPQ değerlendirmesinde toplam ${totalYesAnswers} madde için "Evet", ${totalNoAnswers} madde için "Hayır", ${totalUnknownAnswers} madde için "Bilmiyorum" cevabı verilmiştir.`,
        factors: Object.entries(pdScores)
          .filter(([pdType, _]) => solvedModules.includes(pdType))
          .map(([pdType, yesCount]) => {
            const pdName = scid5SpqCriteria.personalityDisorders[pdType as keyof typeof scid5SpqCriteria.personalityDisorders].name;
            const noCount = pdNoScores[pdType];
            const unknownCount = pdUnknownCounts[pdType];
            const totalQuestions = pdTotalQuestions[pdType];
            
            return `${pdName}: ${yesCount} "Evet" (${((yesCount / totalQuestions) * 100).toFixed(1)}%), ${noCount} "Hayır" (${((noCount / totalQuestions) * 100).toFixed(1)}%), ${unknownCount} "Bilmiyorum" (${((unknownCount / totalQuestions) * 100).toFixed(1)}%) - Toplam ${totalQuestions} soru`;
          })
          .join('\n'),
        risks: 'SCID-5-SPQ değerlendirmesi sonuçlarına göre, kişilik özellikleri hakkında ön bilgi edinilmiştir.',
        symptoms: Object.entries(pdPositives)
          .filter(([pdType, symptoms]) => symptoms.length > 0 && solvedModules.includes(pdType))
          .map(([pdType, symptoms]) => {
            const pdName = scid5SpqCriteria.personalityDisorders[pdType as keyof typeof scid5SpqCriteria.personalityDisorders].name;
            const unknowns = pdUnknowns[pdType];
            
            let result = `${pdName}:\n${symptoms.map(s => `- ${s} (Evet)`).join('\n')}`;
            
            if (unknowns.length > 0) {
              result += `\n${unknowns.map(s => `- ${s} (Bilmiyorum)`).join('\n')}`;
            }
            
            return result;
          })
          .join('\n\n'),
        recommendations: [
          'SCID-5-SPQ değerlendirmesi sonuçlarına göre, kişilik özellikleri hakkında ön bilgi edinilmiştir.',
          totalUnknownAnswers > 0 ? 'Bilmiyorum olarak işaretlenen maddeler için detaylı görüşme yapılması önerilir.' : '',
          'Kişilik özellikleri hakkında daha detaylı bilgi için SCID-5-PD görüşmesi yapılabilir.'
        ].filter(Boolean)
      },
      // PDF raporlama için ek bilgiler
      chartData: chartData, // Sütun grafiği verileri
      pieChartData: pieChartData, // Pasta grafiği verileri
      moduleInfo: moduleInfo, // Modül bilgileri
      solvedModules: solvedModules, // Çözülen modüller
      allModules: scid5SpqModules.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        isSolved: solvedModules.includes(m.id),
        totalQuestions: pdTotalQuestions[m.id]
      }))
    };
  }
}; 