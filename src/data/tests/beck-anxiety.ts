import { Test } from './types';

// Test başlangıç açıklaması
export const beckAnxietyIntro = `
Aşağıda insanların kaygılı ya da endişeli oldukları zamanlarda yaşadıkları bazı belirtiler verilmiştir. 
Lütfen her maddeyi dikkatle okuyunuz. Daha sonra, her maddedeki belirtinin BUGÜN DAHİL SON BİR HAFTADIR sizi ne kadar rahatsız ettiğini size uygun olan seçeneği işaretleyerek belirtiniz.
`;

// Puan aralıklarına göre anksiyete seviyesini belirleyen yardımcı fonksiyon
const getAnxietyLevel = (score: number): string => {
  if (score >= 0 && score <= 7) {
    return 'Düşük seviyede anksiyete';
  } else if (score >= 8 && score <= 15) {
    return 'Orta seviyede anksiyete';
  } else if (score >= 16 && score <= 25) {
    return 'Ağır seviyede anksiyete';
  } else if (score >= 26 && score <= 65) {
    return 'Şiddetli seviyede anksiyete';
  }
  return 'Değerlendirme tamamlandı';
};

export const beckAnxietyTest: Test = {
  id: 'beck-anxiety',
  name: 'Beck Anksiyete Envanteri',
  description: beckAnxietyIntro,
  infoText: 'Bu ölçek, insanların kaygılı ya da endişeli oldukları zamanlarda yaşadıkları belirtileri değerlendirmek için kullanılır.',
  reference: 'https://www.researchgate.net/profile/Elif-Gueneri-Yoeyen/publication/331407570_Psikolojide_Kullanilan_Olcekler/links/5c77e2c0458515831f76da91/Psikolojide-Kullanilan-Oelcekler.pdf',
  
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
      text: 'Sıcak/ ateş basmaları',
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
    return getAnxietyLevel(score);
  },
  
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const severityLevel = getAnxietyLevel(totalScore);
    
    return {
      score: totalScore,
      severityLevel: severityLevel,
      factorScores: {},
      factorAverages: {},
      riskFactors: [],
      requiresTreatment: totalScore > 15
    };
  }
}; 