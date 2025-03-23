import { Test } from './types';

// Test başlangıç açıklaması
export const scl90rIntro = `
SCL-90-R (Symptom Checklist-90-Revised) kişinin kendisinin doldurduğu, ruhsal belirtileri taramaya, hangi düzeyde olduğunu belirlemeye ve alınacak tedaviye yön göstermeye yarayan 90 maddelik bir ölçektir.

Aşağıda zaman zaman herkeste olabilecek yakınma ve sorunların bir listesi vardır. Lütfen her birini dikkatlice okuyunuz. Sonra bu durumun bugün de dahil olmak üzere SON 15 GÜN içinde sizi ne ölçüde huzursuz ve tedirgin ettiğini göz önüne alarak, uygun seçeneği işaretleyiniz. Düşüncenizi değiştirirseniz ilk yaptığınız işaretlemeyi tamamen siliniz. Lütfen anlamadığınız bir cümle ile karşılaştığınızda uygulayan kişiye danışınız.
`;

// Test soruları
export const scl90rTest: Test = {
  id: 'scl90r',
  name: 'SCL-90-R (Belirti Tarama Listesi)',
  description: scl90rIntro,
  infoText: 'SCL-90-R (Symptom Check List-90), L.R. Derogatis tarafından 1977 yılında geliştirilmiş ve Türkçe geçerlik-güvenirlik çalışması Dağ tarafından 1991 yılında yapılmıştır. Ölçeğin iç tutarlılığı 0.97, test-tekrar test güvenirlik katsayıları alt ölçeklere göre 0.65 ile 0.87 arasında ve tüm ölçek için 0.90 olarak bulunmuştur. Ölçek, bireyin yaşadığı olumsuz stres tepkisinin (distress) düzeyini ölçmeyi amaçlar ve 17 yaş üstü, en az orta öğretimden geçmiş kişilere uygulanabilir. Somatizasyon, obsesif-kompulsif, kişilerarası duyarlık, depresyon, kaygı, düşmanlık, fobik kaygı, paranoid düşünce ve psikotizm olmak üzere toplam dokuz alt boyutu bulunmaktadır.',
  reference: 'https://www.researchgate.net/profile/Elif-Gueneri-Yoeyen/publication/331407570_Psikolojide_Kullanilan_Olcekler/links/5c77e2c0458515831f76da91/Psikolojide-Kullanilan-Oelcekler.pdf',
  
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
      text: 'Başka kişilerin duymadıkları sesleri duyma',
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
      text: 'Tuzağa düşürülmüş veya yakalanmış olma hissi',
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
      text: 'Belin alt kısmında ağrılar',
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
      text: 'Her şey için çok fazla endişe duyma',
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
      text: 'Diğer insanların sizin özel düşüncelerinizi bilmesi',
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
      text: 'İşlerin doğru yapıldığından emin olmak için çok yavaş yapmak',
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
      text: 'Kalbin çok hızlı çarpması',
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
      text: 'Adale (kas) ağrıları',
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
      text: 'Karar vermede güçlük',
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
      text: 'Sizi korkutan belirli uğraş, yer ve nesnelerden kaçınma durumu',
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
      text: 'Hiçbir şey düşünmeme hali',
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
      text: 'Gelecek konusunda ümitsizlik',
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
      text: 'Bedeninizin çeşitli kısımlarında zayıflılık hissi',
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
      text: 'Ölüm ya da ölme düşünceleri',
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
      text: 'İnsanlar size baktığı veya hakkınızda konuştuğu zaman rahatsızlık duyma',
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
      text: 'Bir başkasına vurmak, zarar vermek, yaralamak dürtülerinin olması',
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
      text: 'Yıkanma, sayma, dokunma gibi bazı hareketleri yenileme hali',
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
      text: 'Bazı şeyleri kırıp dökme hissi',
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
      text: 'Başkalarının paylaşıp kabul etmediği inanç ve düşüncelerin olması',
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
      text: 'Toplum içinde yiyip-içerken huzursuzluk hissi',
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
      text: 'Yalnız bırakıldığınızda sinirlilik hali',
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
      text: 'Başkalarının sizi başarılarınız için yeterince takdir etmediği duygusu',
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
      text: 'Başkalarıyla birlikte olunan durumlarda bile yalnızlık hissetme',
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
      text: 'Yerinizde duramayacak ölçüde rahatsızlık hissetme',
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
      text: 'Size kötü bir şey olacakmış hissi',
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
      text: 'Cinsiyet konusunda sizi çok rahatsız eden düşüncelerin olması',
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
      text: 'Başka bir kişiye asla yakınlık duymama',
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
      text: 'Suçluluk duygusu',
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
      text: 'Aklınızda bir bozukluğun olduğu düşüncesi',
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
    const validAnswers = Object.values(answers).filter(value => value !== undefined);
    const sum = validAnswers.reduce((total, value) => total + (Number(value) || 0), 0);
    return validAnswers.length > 0 ? sum / validAnswers.length : 0;
  },
  
  interpretScore: (score) => {
    if (score < 0.5) {
      return 'Normal düzeyde psikolojik belirti';
    } else if (score < 1.0) {
      return 'Hafif düzeyde psikolojik belirti';
    } else if (score < 1.5) {
      return 'Orta düzeyde psikolojik belirti';
    } else if (score < 2.5) {
      return 'Araz düzeyi yüksek';
    } else {
      return 'Araz düzeyi çok yüksek';
    }
  },
  
  generateReport: (answers) => {
    // Alt ölçekler için soru gruplandırmaları
    const subScales = {
      somatizasyon: ['SCL1', 'SCL4', 'SCL12', 'SCL27', 'SCL40', 'SCL42', 'SCL48', 'SCL49', 'SCL52', 'SCL53', 'SCL56', 'SCL58'],
      obsesifKompulsif: ['SCL3', 'SCL9', 'SCL10', 'SCL28', 'SCL38', 'SCL45', 'SCL46', 'SCL51', 'SCL55', 'SCL65'],
      kisiselDuyarlik: ['SCL6', 'SCL21', 'SCL34', 'SCL36', 'SCL37', 'SCL41', 'SCL61', 'SCL69', 'SCL73'],
      depresyon: ['SCL5', 'SCL14', 'SCL15', 'SCL20', 'SCL22', 'SCL26', 'SCL29', 'SCL30', 'SCL31', 'SCL32', 'SCL54', 'SCL71', 'SCL79'],
      anksiyete: ['SCL2', 'SCL17', 'SCL23', 'SCL33', 'SCL39', 'SCL57', 'SCL72', 'SCL78', 'SCL80', 'SCL86'],
      hostilite: ['SCL11', 'SCL24', 'SCL63', 'SCL67', 'SCL74', 'SCL81'],
      fobikAnksiyete: ['SCL13', 'SCL25', 'SCL47', 'SCL50', 'SCL70', 'SCL75', 'SCL82'],
      paranoidDusunce: ['SCL8', 'SCL18', 'SCL43', 'SCL68', 'SCL76', 'SCL83'],
      psikotizm: ['SCL7', 'SCL16', 'SCL35', 'SCL62', 'SCL77', 'SCL84', 'SCL85', 'SCL87', 'SCL88', 'SCL90'],
      ekMaddeler: ['SCL19', 'SCL44', 'SCL55', 'SCL59', 'SCL60', 'SCL64', 'SCL89']
    };

    // Alt ölçek puanlarını hesaplama
    const factorScores = {};
    const factorAverages = {};
    
    Object.keys(subScales).forEach(scale => {
      const scaleQuestions = subScales[scale];
      let sum = 0;
      let count = 0;
      
      scaleQuestions.forEach(q => {
        if (answers[q] !== undefined) {
          sum += Number(answers[q]) || 0;
          count++;
        }
      });
      
      factorScores[scale] = sum;
      factorAverages[scale] = count > 0 ? sum / count : 0;
    });
    
    // Genel Semptom İndeksi (GSI) hesaplama
    const validAnswers = Object.values(answers).filter(value => value !== undefined);
    
    // 18 maddeden fazla boş bırakılmışsa hesaplama yapma (72 ya da daha fazla yanıtlanmış olmalı)
    const isValidTest = validAnswers.length >= 72;
    
    const sum = validAnswers.reduce((total, value) => total + (Number(value) || 0), 0);
    const gsi = isValidTest && validAnswers.length > 0 ? sum / validAnswers.length : 0;

    // Rahatsızlık Ciddiyeti İndeksi (PSDI) hesaplama
    const nonZeroAnswers = Object.values(answers).filter(value => value !== undefined && Number(value) > 0);
    const psdi = nonZeroAnswers.length > 0 ? sum / nonZeroAnswers.length : 0;

    // Belirti Toplamı (PST) hesaplama
    const pst = nonZeroAnswers.length;

    // Şiddet seviyesi ve tedavi gerekliliği belirleme
    let severityLevel = '';
    let requiresTreatment = false;
    
    if (gsi < 0.5) {
      severityLevel = 'Normal düzeyde psikolojik belirti';
      requiresTreatment = false;
    } else if (gsi < 1.0) {
      severityLevel = 'Hafif düzeyde psikolojik belirti';
      requiresTreatment = false;
    } else if (gsi < 1.5) {
      severityLevel = 'Normal';
      requiresTreatment = false;
    } else if (gsi < 2.5) {
      severityLevel = 'Araz düzeyi yüksek';
      requiresTreatment = true;
    } else {
      severityLevel = 'Araz düzeyi çok yüksek';
      requiresTreatment = true;
    }

    // Risk faktörleri belirleme
    const riskFactors = [];
    
    // İntihar düşüncesi riski
    if (answers['SCL15'] >= 2 || answers['SCL59'] >= 2) {
      riskFactors.push('İntihar düşüncesi riski');
    }
    
    // Psikotik belirti riski
    if (factorAverages['psikotizm'] >= 1.5) {
      riskFactors.push('Psikotik belirti riski');
    }
    
    // Depresyon riski
    if (factorAverages['depresyon'] >= 1.5) {
      riskFactors.push('Depresyon riski');
    }
    
    // Alt ölçek değerlendirmeleri
    const subScaleAssessments = {};
    Object.keys(factorAverages).forEach(scale => {
      const score = factorAverages[scale];
      let assessment = '';
      
      if (score <= 1.5) {
        assessment = 'Normal';
      } else if (score <= 2.5) {
        assessment = 'Araz düzeyi yüksek';
      } else {
        assessment = 'Araz düzeyi çok yüksek';
      }
      
      subScaleAssessments[scale] = assessment;
    });

    return {
      score: gsi,
      psdi: psdi,
      pst: pst,
      factorScores: factorScores,
      factorAverages: factorAverages,
      subScaleAssessments: subScaleAssessments,
      severityLevel: severityLevel,
      requiresTreatment: requiresTreatment,
      riskFactors: riskFactors,
      isValidTest: isValidTest
    };
  }
}; 