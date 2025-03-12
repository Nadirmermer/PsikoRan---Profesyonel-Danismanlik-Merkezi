import { Test } from './types';

// Test başlangıç açıklaması
export const beckAnxietyIntro = `Aşağıda insanların kaygılı ya da endişeli oldukları zamanlarda yaşadıkları bazı belirtiler verilmiştir.
Lütfen her maddeyi dikkatle okuyunuz. Daha sonra, her maddedeki belirtinin BUGÜN DAHİL SON BİR (1) HAFTADIR sizi ne kadar rahatsız ettiğini seçeneği işaretleyerek belirleyiniz.`;

// Puanlama kriterleri ve açıklamalar
export const beckAnxietyCriteria = {
  scoring: {
    minimal: { min: 0, max: 7, description: 'Minimal düzeyde anksiyete' },
    mild: { min: 8, max: 15, description: 'Hafif düzeyde anksiyete' },
    moderate: { min: 16, max: 25, description: 'Orta düzeyde anksiyete' },
    severe: { min: 26, max: 63, description: 'Şiddetli düzeyde anksiyete' }
  },
  interpretation: [
    'Toplam puan 0-7 arası: Minimal düzeyde anksiyete',
    'Toplam puan 8-15 arası: Hafif düzeyde anksiyete',
    'Toplam puan 16-25 arası: Orta düzeyde anksiyete',
    'Toplam puan 26-63 arası: Şiddetli düzeyde anksiyete'
  ],
  notes: [
    'Beck Anksiyete Envanteri, anksiyete belirtilerinin şiddetini ölçmek için kullanılır.',
    'Son bir hafta içindeki belirtileri değerlendirir.',
    'Her madde 0-3 arası puanlanır.',
    'Toplam puan 0-63 arasında değişir.'
  ]
};

export const beckAnxietyTest: Test = {
  id: 'beck-anxiety',
  name: 'Beck Anksiyete Testi',
  description: beckAnxietyIntro,
  infoText: beckAnxietyIntro,
  questions: [
    {
      id: 'BA1',
      text: 'Bedeninizin herhangi bir yerinde uyuşma veya karıncalanma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA2',
      text: 'Sıcak/ateş basmaları',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA3',
      text: 'Bacaklarda halsizlik, titreme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA4',
      text: 'Gevşeyememe',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA5',
      text: 'Çok kötü şeyler olacak korkusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA6',
      text: 'Baş dönmesi veya sersemlik',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA7',
      text: 'Kalp çarpıntısı',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA8',
      text: 'Dengeyi kaybetme duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA9',
      text: 'Dehşete kapılma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA10',
      text: 'Sinirlilik',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA11',
      text: 'Boğuluyormuş gibi olma duygusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA12',
      text: 'Ellerde titreme',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA13',
      text: 'Titreklik',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA14',
      text: 'Kontrolü kaybetme korkusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA15',
      text: 'Nefes almada güçlük',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA16',
      text: 'Ölüm korkusu',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA17',
      text: 'Korkuya kapılma',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA18',
      text: 'Midede hazımsızlık ya da rahatsızlık hissi',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA19',
      text: 'Baygınlık',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA20',
      text: 'Yüzün kızarması',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    },
    {
      id: 'BA21',
      text: 'Terleme (sıcaklığa bağlı olmayan)',
      options: [
        { value: 0, text: 'Hiç' },
        { value: 1, text: 'Hafif düzeyde (Beni pek etkilemedi)' },
        { value: 2, text: 'Orta düzeyde (Hoş değildi ama katlanabildin)' },
        { value: 3, text: 'Ciddi düzeyde (Dayanmakta çok zorlandım)' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score <= beckAnxietyCriteria.scoring.minimal.max) 
      return beckAnxietyCriteria.scoring.minimal.description;
    if (score <= beckAnxietyCriteria.scoring.mild.max) 
      return beckAnxietyCriteria.scoring.mild.description;
    if (score <= beckAnxietyCriteria.scoring.moderate.max) 
      return beckAnxietyCriteria.scoring.moderate.description;
    return beckAnxietyCriteria.scoring.severe.description;
  }
}; 