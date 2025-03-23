import { Test } from './types';

// Test başlangıç açıklaması
export const asöIntro = `
Algılanan Stres Ölçeği, Cohen, Kamarck ve Mermelstein tarafından kişilerin hayatlarındaki birtakım durumların ne derece stresli algılandığını ölçmek amacıyla geliştirilmiştir.

Aşağıda geçtiğimiz ay içerisindeki kişisel deneyimleriniz hakkında bir dizi soru yöneltilmektedir. Her soruyu dikkatlice okuyarak size en uygun seçeneği işaretleyiniz.
`;

export const algılananStresTest: Test = {
  id: 'aso',
  name: 'Algılanan Stres Ölçeği (ASÖ-14)',
  description: asöIntro,
  infoText: 'Bu test, kişilerin hayatlarındaki durumları ne derece stresli algıladığını ölçmek amacıyla kullanılan, 14 maddeden oluşan bir ölçektir. Ölçek "yetersiz özyeterlik algısı" ve "stres/rahatsızlık algısı" olmak üzere 2 alt boyuttan oluşur. Puanların yüksek olması kişinin stres algısının fazla olduğunu göstermektedir.',
  reference: 'Eskin, M., Harlak, H., Demirkıran, F., & Dereboy, Ç. (2013). Algılanan Stres Ölçeğinin Türkçeye uyarlanması: güvenirlik ve geçerlik analizi. New/Yeni Symposium Journal, 51(3), 132-140.',

  questions: [
    {
      id: 'ASO1',
      text: 'Geçen ay, beklenmedik bir şeylerin olması nedeniyle ne sıklıkta rahatsızlık duydunuz?',
      options: [
        { value: 0, text: 'Hiçbir Zaman' },
        { value: 1, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Oldukça Sık' },
        { value: 4, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO2',
      text: 'Geçen ay, hayatınızdaki önemli şeyleri kontrol edemediğinizi ne sıklıkta hissettiniz?',
      options: [
        { value: 0, text: 'Hiçbir Zaman' },
        { value: 1, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Oldukça Sık' },
        { value: 4, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO3',
      text: 'Geçen ay, kendinizi ne sıklıkta sinirli ve stresli hissettiniz?',
      options: [
        { value: 0, text: 'Hiçbir Zaman' },
        { value: 1, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Oldukça Sık' },
        { value: 4, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO4',
      text: 'Geçen ay, ne sıklıkta gündelik zorlukların üstesinden başarıyla geldiniz?',
      options: [
        { value: 4, text: 'Hiçbir Zaman' },
        { value: 3, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Oldukça Sık' },
        { value: 0, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO5',
      text: 'Geçen ay, hayatınızda ortaya çıkan önemli değişikliklerle etkili bir şekilde başa çıktığınızı ne sıklıkta hissettiniz?',
      options: [
        { value: 4, text: 'Hiçbir Zaman' },
        { value: 3, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Oldukça Sık' },
        { value: 0, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO6',
      text: 'Geçen ay, kişisel sorunlarınızı ele alma yeteneğinize ne sıklıkta güven duydunuz?',
      options: [
        { value: 4, text: 'Hiçbir Zaman' },
        { value: 3, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Oldukça Sık' },
        { value: 0, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO7',
      text: 'Geçen ay, her şeyin yolunda gittiğini ne sıklıkta hissettiniz?',
      options: [
        { value: 4, text: 'Hiçbir Zaman' },
        { value: 3, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Oldukça Sık' },
        { value: 0, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO8',
      text: 'Geçen ay, ne sıklıkta yapmanız gereken şeylerle başa çıkamadığınızı fark ettiniz?',
      options: [
        { value: 0, text: 'Hiçbir Zaman' },
        { value: 1, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Oldukça Sık' },
        { value: 4, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO9',
      text: 'Geçen ay, hayatınızdaki zorlukları ne sıklıkta kontrol edebildiniz?',
      options: [
        { value: 4, text: 'Hiçbir Zaman' },
        { value: 3, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Oldukça Sık' },
        { value: 0, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO10',
      text: 'Geçen ay, ne sıklıkta her şeyin üstesinden geldiğinizi hissettiniz?',
      options: [
        { value: 4, text: 'Hiçbir Zaman' },
        { value: 3, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Oldukça Sık' },
        { value: 0, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO11',
      text: 'Geçen ay, ne sıklıkta kontrolünüz dışında gelişen olaylar yüzünden öfkelendiniz?',
      options: [
        { value: 0, text: 'Hiçbir Zaman' },
        { value: 1, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Oldukça Sık' },
        { value: 4, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO12',
      text: 'Geçen ay, kendinizi ne sıklıkta başarmak zorunda olduğunuz şeyleri düşünürken buldunuz?',
      options: [
        { value: 0, text: 'Hiçbir Zaman' },
        { value: 1, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Oldukça Sık' },
        { value: 4, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO13',
      text: 'Geçen ay, ne sıklıkta zamanınızı nasıl kullanacağınızı kontrol edebildiniz?',
      options: [
        { value: 4, text: 'Hiçbir Zaman' },
        { value: 3, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 1, text: 'Oldukça Sık' },
        { value: 0, text: 'Çok Sık' }
      ]
    },
    {
      id: 'ASO14',
      text: 'Geçen ay, ne sıklıkta problemlerin üstesinden gelemeyeceğiniz kadar biriktiğini hissettiniz?',
      options: [
        { value: 0, text: 'Hiçbir Zaman' },
        { value: 1, text: 'Neredeyse Hiçbir Zaman' },
        { value: 2, text: 'Bazen' },
        { value: 3, text: 'Oldukça Sık' },
        { value: 4, text: 'Çok Sık' }
      ]
    }
  ],
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  interpretScore: (score) => {
    if (score <= 14) {
      return 'Düşük düzeyde algılanan stres';
    } else if (score <= 28) {
      return 'Orta düzeyde algılanan stres';
    } else {
      return 'Yüksek düzeyde algılanan stres';
    }
  },
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    // Alt boyut puanları hesaplama
    const yetersizOzyeterlik = ['ASO4', 'ASO5', 'ASO6', 'ASO8', 'ASO9', 'ASO10', 'ASO13']
      .reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    
    const stresRahatsizlik = ['ASO1', 'ASO2', 'ASO3', 'ASO7', 'ASO11', 'ASO12', 'ASO14']
      .reduce((sum, id) => sum + (Number(answers[id]) || 0), 0);
    
    // Ortalama alt boyut puanları - Number() ile çeviriyoruz
    const yetersizOzyeterlikOrt = Number((yetersizOzyeterlik / 7).toFixed(2));
    const stresRahatsizlikOrt = Number((stresRahatsizlik / 7).toFixed(2));
    
    let severityMessage = '';
    if (totalScore <= 14) {
      severityMessage = 'Düşük düzeyde algılanan stres';
    } else if (totalScore <= 28) {
      severityMessage = 'Orta düzeyde algılanan stres';
    } else {
      severityMessage = 'Yüksek düzeyde algılanan stres';
    }
    
    // Risk faktörleri belirleme
    const riskFactors = [];
    if (totalScore > 28) {
      riskFactors.push('Yüksek stres düzeyi');
    }
    if (yetersizOzyeterlik > 14) {
      riskFactors.push('Yetersiz özyeterlik algısı');
    }
    if (stresRahatsizlik > 14) {
      riskFactors.push('Yüksek stres/rahatsızlık algısı');
    }
    
    return {
      score: totalScore,
      severityLevel: severityMessage,
      factorScores: {
        'Yetersiz Özyeterlik Algısı': yetersizOzyeterlik,
        'Stres/Rahatsızlık Algısı': stresRahatsizlik
      },
      factorAverages: {
        'Yetersiz Özyeterlik Algısı Ortalaması': yetersizOzyeterlikOrt,
        'Stres/Rahatsızlık Algısı Ortalaması': stresRahatsizlikOrt
      },
      riskFactors: riskFactors,
      requiresTreatment: totalScore > 28
    };
  }
}; 