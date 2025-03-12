import { Test } from './types';

// Test başlangıç açıklaması
export const scl90rIntro = `
Aşağıda zaman zaman herkeste olabilecek yakınma ve sorunların bir listesi vardır.

Lütfen her birini dikkatlice okuyunuz. Sonra bu durumun bugün de dahil olmak üzere son 15
gün içinde sizi ne ölçüde huzursuz ve tedirgin ettiğini göz önüne alarak, cevap kağıdında
belirtilen tanımlamalardan (Hiç / Çok az / Orta derecede / Oldukça fazla / İleri derecede)
uygun olanının (yalnızca bir seçeneği) işaretleyin.

Düşüncenizi değiştirirseniz işaretlemeyi değiştirmeyi unutmayınız. 
Lütfen anlamadığınız bir cümle ile karşılaştığınızda uygulayan kişiye danışınız.
`;

// Puanlama kriterleri ve açıklamalar
export const scl90rCriteria = {
  scoring: {
    normal: { min: 0, max: 1.50, description: 'Normal düzey' },
    high: { min: 1.51, max: 2.50, description: 'Araz düzeyi yüksek' },
    veryHigh: { min: 2.51, max: 4.00, description: 'Araz düzeyi çok yüksek' }
  },
  subscales: {
    somatization: {
      name: 'Somatizasyon',
      questions: [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58],
      description: 'Bedensel işlevlerle ilgili öznel sıkıntılar'
    },
    obsessiveCompulsive: {
      name: 'Obsesif-Kompulsif',
      questions: [3, 9, 10, 28, 38, 45, 46, 51, 55, 65],
      description: 'İstem dışı düşünce, dürtü ve eylemler'
    },
    interpersonalSensitivity: {
      name: 'Kişilerarası Duyarlılık',
      questions: [6, 21, 34, 36, 37, 41, 61, 69, 73],
      description: 'Kişisel yetersizlik ve aşağılık duyguları'
    },
    depression: {
      name: 'Depresyon',
      questions: [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79],
      description: 'Depresif belirti ve semptomlar'
    },
    anxiety: {
      name: 'Anksiyete',
      questions: [2, 17, 23, 33, 39, 57, 72, 78, 80, 86],
      description: 'Kaygı ve endişe belirtileri'
    },
    hostility: {
      name: 'Öfke ve Düşmanlık',
      questions: [11, 24, 63, 67, 74, 81],
      description: 'Öfke, agresyon ve irritabilite'
    },
    phobicAnxiety: {
      name: 'Fobik Anksiyete',
      questions: [13, 25, 47, 50, 70, 75, 82],
      description: 'Fobik kaygı ve kaçınma davranışı'
    },
    paranoid: {
      name: 'Paranoid Düşünce',
      questions: [8, 18, 43, 68, 76, 83],
      description: 'Şüphecilik ve paranoid düşünceler'
    },
    psychoticism: {
      name: 'Psikotizm',
      questions: [7, 16, 35, 62, 77, 84, 85, 87, 88, 90],
      description: 'İzolasyon ve şizoid yaşam tarzı'
    },
    additional: {
      name: 'Ek Maddeler',
      questions: [19, 44, 55, 59, 60, 64, 89],
      description: 'Uyku ve yeme bozuklukları ile ilgili ek belirtiler'
    }
  },
  interpretation: [
    'GSI (Genel Semptom Ortalaması) = Tüm maddelerin toplam puanı / 90',
    'Alt ölçek puanı = Alt ölçek maddelerinin toplam puanı / Alt ölçek madde sayısı',
    '0.00 - 1.50: Normal düzey',
    '1.51 - 2.50: Araz düzeyi yüksek',
    '2.51 - 4.00: Araz düzeyi çok yüksek'
  ],
  notes: [
    'Her bir madde 0-4 arası puanlanır',
    'Geçerli bir değerlendirme için en fazla 18 madde boş bırakılabilir',
    'GSI, genel psikolojik sıkıntı düzeyini gösterir'
  ]
};

// Tip tanımlamaları
interface SubscaleScores {
  [key: string]: number;
}

interface SubscaleAverages {
  [key: string]: number;
}

export const scl90rTest: Test = {
  id: 'scl90r',
  name: 'SCL-90-R Belirti Tarama Listesi',
  description: scl90rIntro,
  questions: [
    {
      id: 'SCL1',
      text: 'Baş ağrısı',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL2',
      text: 'Sinirlilik ya da içinin titremesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL3',
      text: 'Zihinden atamadığınız, tekrarlayan, hoşa gitmeyen düşünceler',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL4',
      text: 'Baygınlık ya da baş dönmesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL5',
      text: 'Cinsel arzu ve ilginin kaybı',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL6',
      text: 'Başkaları tarafından eleştirilme duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL7',
      text: 'Herhangi bir kimsenin düşüncelerinizi kontrol edebileceği fikri',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL8',
      text: 'Sorunlarınızdan pek çoğu için başkalarının suçlanması gerektiği duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL9',
      text: 'Olayları anımsamada güçlük',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL10',
      text: 'Dikkatsizlik ya da sakarlıkla ilgili endişeler',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL11',
      text: 'Kolayca gücenme, rahatsız olma hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL12',
      text: 'Göğüs ya da kalp bölgesinde ağrılar',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL13',
      text: 'Caddelerde veya açık alanlarda korku hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL14',
      text: 'Enerjinizde azalma veya yavaşlama hali',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL15',
      text: 'Yaşamınızın sonlanması düşünceleri',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL16',
      text: 'Başka kişilerin duyamadığı sesler duyma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL17',
      text: 'Titreme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL18',
      text: 'Çoğu kişiye güvenilmemesi gerektiği hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL19',
      text: 'İştah azalması',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL20',
      text: 'Kolayca ağlama',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL21',
      text: 'Karşı cinsten kişilerle utangaçlık ve rahatsızlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL22',
      text: 'Tuzağa düşürülmüş veya yakalanmış hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL23',
      text: 'Bir neden olmaksızın aniden korkuya kapılma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL24',
      text: 'Kontrol edilemeyen öfke patlamaları',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL25',
      text: 'Evden dışarı yalnız çıkma korkusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL26',
      text: 'Olanlar için kendini suçlama',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL27',
      text: 'Bel ağrısı',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL28',
      text: 'İşlerin yapılmasında erteleme duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL29',
      text: 'Yalnızlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL30',
      text: 'Karamsarlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL31',
      text: 'Her şey için endişelenme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL32',
      text: 'Her şeye karşı ilgisizlik hali',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL33',
      text: 'Korku hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL34',
      text: 'Duygularınızın kolayca incitilebilmesi hali',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL35',
      text: 'Başka kişilerin sizin özel düşüncelerinizi bilmesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL36',
      text: 'Başkalarının sizi anlamadığı veya hissedemeyeceği duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL37',
      text: 'Başkalarının sizi sevmediği ya da dostça olmayan davranışlar gösterdiği hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL38',
      text: 'İşlerin doğru yapıldığından emin olabilmek için çok yavaş yapmak',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL39',
      text: 'Kalbin çarpması',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL40',
      text: 'Bulantı ve midede rahatsızlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL41',
      text: 'Kendini başkalarından aşağı görme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL42',
      text: 'Kas ağrıları',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL43',
      text: 'Başkalarının sizi gözlediği veya hakkınızda konuştuğu hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL44',
      text: 'Uykuya dalmada güçlük',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL45',
      text: 'Yaptığınız işleri bir ya da birkaç kez kontrol etme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL46',
      text: 'Karar vermede güçlükler',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL47',
      text: 'Otobüs, tren, metro gibi araçlarla yolculuk etme korkusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL48',
      text: 'Nefes almada güçlük',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL49',
      text: 'Soğuk ve sıcak basması',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL50',
      text: 'Sizi korkutan belirli uğraş, yer veya nesnelerden kaçınma durumu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL51',
      text: 'Hiçbir şey düşünememe hali',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL52',
      text: 'Bedeninizin bazı kısımlarında uyuşma, karıncalanma olması',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL53',
      text: 'Boğazınıza bir yumru tıkanmış hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL54',
      text: 'Gelecek konusunda umutsuzluk',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL55',
      text: 'Düşüncelerinizi bir konuya yoğunlaştırmada güçlük',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL56',
      text: 'Bedeninizin çeşitli kısımlarında zayıflık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL57',
      text: 'Gerginlik veya coşku hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL58',
      text: 'Kol ve bacaklarda ağırlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL59',
      text: 'Ölüm ve ölme düşünceleri',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL60',
      text: 'Aşırı yemek yeme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL61',
      text: 'İnsanlar size baktığı veya hakkınızda konuştuğu zaman tedirginlik duyma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL62',
      text: 'Size ait olmayan düşüncelere sahip olma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL63',
      text: 'Bir başkasına vurmak, zarar vermek, yaralamak dürtülerini hissetme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL64',
      text: 'Sabahın erken saatlerinde uyanma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL65',
      text: 'Yıkanma, sayma, dokunma gibi bazı hareketleri yineleme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL66',
      text: 'Uykuda huzursuzluk, rahat uyuyamama',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL67',
      text: 'Bazı şeyleri kırıp dökme isteği',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL68',
      text: 'Başkalarının paylaşıp kabul etmediği inanç ve düşüncelere sahip olma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL69',
      text: 'Başkalarının yanında kendini çok sıkılgan hissetme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL70',
      text: 'Çarşı, sinema gibi kalabalık yerlerde rahatsızlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL71',
      text: 'Her şeyin bir yük gibi görünmesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL72',
      text: 'Dehşet ve panik nöbetleri',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL73',
      text: 'Toplum içinde yiyip içerken huzursuzluk hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL74',
      text: 'Sık sık tartışmaya girme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL75',
      text: 'Yalnız bırakıldığında sinirlilik hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL76',
      text: 'Başkalarının sizi takdir etmemesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL77',
      text: 'Başkalarıyla birlikte olmadığınızda yalnızlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL78',
      text: 'Yerinizde duramayacak kadar tedirgin hissetme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL79',
      text: 'Değersizlik duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL80',
      text: 'Size kötü bir şey olacakmış duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL81',
      text: 'Bağırma ya da eşyaları fırlatma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL82',
      text: 'Topluluk içinde bayılacağınız korkusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL83',
      text: 'Eğer izin verirseniz insanların sizi sömüreceği duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL84',
      text: 'Cinsellik konusunda sizi çok rahatsız eden düşünceler',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL85',
      text: 'Günahlarınızdan dolayı cezalandırılmanız gerektiği düşüncesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL86',
      text: 'Korkutucu türden düşünce ve hayaller',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL87',
      text: 'Bedeninizde ciddi bir rahatsızlık olduğu düşüncesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL88',
      text: 'Başka bir kişiye karşı asla yakınlık duyamama',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL89',
      text: 'Suçluluk duyguları',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    },
    {
      id: 'SCL90',
      text: 'Aklınızda bir bozukluk olduğu düşüncesi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Çok Az' },
        { value: 2, text: 'Orta Derecede' },
        { value: 3, text: 'Oldukça Fazla' },
        { value: 4, text: 'İleri Derecede' }
      ]
    }
  ],
  calculateScore: (answers) => {
    // Toplam puan hesaplama
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    // GSI hesaplama (Genel Semptom Ortalaması)
    return totalScore / 90;
  },
  interpretScore: (score) => {
    if (score <= scl90rCriteria.scoring.normal.max) 
      return scl90rCriteria.scoring.normal.description;
    if (score <= scl90rCriteria.scoring.high.max) 
      return scl90rCriteria.scoring.high.description;
    return scl90rCriteria.scoring.veryHigh.description;
  },
  generateReport: (answers) => {
    // GSI hesaplama
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const gsi = totalScore / 90;

    // Alt ölçek puanlarını hesapla
    const subscaleScores: SubscaleScores = {};
    const subscaleAverages: SubscaleAverages = {};
    Object.entries(scl90rCriteria.subscales).forEach(([key, subscale]) => {
      const score = subscale.questions.reduce((sum, q) => sum + (Number(answers[`SCL${q}`]) || 0), 0);
      subscaleScores[key] = score;
      subscaleAverages[key] = score / subscale.questions.length;
    });

    // Çizgi grafiği için veri hazırla
    const chartData = {
      labels: Object.entries(scl90rCriteria.subscales).map(([_, subscale]) => subscale.name),
      datasets: [
        {
          data: Object.values(subscaleAverages),
          normalRange: {
            min: 0,
            max: 1.5,
            label: 'Normal Düzey'
          },
          highRange: {
            min: 1.51,
            max: 2.5,
            label: 'Yüksek Düzey'
          },
          veryHighRange: {
            min: 2.51,
            max: 4,
            label: 'Çok Yüksek Düzey'
          }
        }
      ]
    };

    // Şiddet düzeyini belirle
    let severityLevel = '';
    if (gsi <= scl90rCriteria.scoring.normal.max) {
      severityLevel = scl90rCriteria.scoring.normal.description;
    } else if (gsi <= scl90rCriteria.scoring.high.max) {
      severityLevel = scl90rCriteria.scoring.high.description;
    } else {
      severityLevel = scl90rCriteria.scoring.veryHigh.description;
    }

    // Risk faktörlerini belirle
    const riskFactors: string[] = [];
    Object.entries(subscaleAverages).forEach(([key, average]) => {
      const subscale = scl90rCriteria.subscales[key as keyof typeof scl90rCriteria.subscales];
      if (average > 2.5) {
        riskFactors.push(`${subscale.name}: Çok Yüksek Düzey`);
      } else if (average > 1.5) {
        riskFactors.push(`${subscale.name}: Yüksek Düzey`);
      }
    });

    // Öne çıkan belirtileri belirle
    const prominentSymptoms = Object.entries(answers)
      .filter(([_, value]) => Number(value) >= 3)
      .map(([key]) => {
        const questionNumber = parseInt(key.replace('SCL', ''));
        return {
          question: questionNumber,
          severity: Number(answers[key]),
          response: scl90rTest.questions[questionNumber - 1].text
        };
      });

    return {
      totalScore,
      severityLevel,
      factorScores: subscaleScores,
      factorAverages: subscaleAverages,
      riskFactors,
      prominentSymptoms,
      requiresTreatment: gsi > 1.5,
      chartData, // Çizgi grafiği için veri
      interpretation: {
        overall: `Danışanın SCL-90-R Genel Semptom Ortalaması (GSI) ${gsi.toFixed(2)} olup, bu puan "${severityLevel}" düzeyine işaret etmektedir.`,
        factors: `
          Alt ölçek ortalamaları:
          ${Object.entries(subscaleAverages).map(([key, avg]) => {
            const subscale = scl90rCriteria.subscales[key as keyof typeof scl90rCriteria.subscales];
            return `- ${subscale.name}: ${avg.toFixed(2)}`;
          }).join('\n')}
        `,
        risks: riskFactors.length > 0 
          ? `Yüksek düzeyde belirti gösteren alanlar: ${riskFactors.join(', ')}`
          : 'Belirgin risk alanı saptanmamıştır.',
        symptoms: prominentSymptoms.length > 0
          ? `Öne çıkan belirtiler:\n${prominentSymptoms.map(s => `- ${s.response}`).join('\n')}`
          : 'Belirgin semptom saptanmamıştır.',
        recommendations: [
          gsi > 2.5 ? 'Acil psikiyatrik değerlendirme önerilir.' : '',
          gsi > 1.5 ? 'Klinik değerlendirme önerilir.' : 'Periyodik kontrol önerilir.',
          ...Object.entries(subscaleAverages)
            .filter(([_, avg]) => avg > 2.5)
            .map(([key, _]) => `${scl90rCriteria.subscales[key as keyof typeof scl90rCriteria.subscales].name} alanı için özel değerlendirme gereklidir.`)
        ].filter(r => r !== '')
      }
    };
  }
}; 