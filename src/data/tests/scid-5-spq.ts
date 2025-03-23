import { Test } from './types';

// Test başlangıç açıklaması
export const scid5SpqIntro = `
SCID-5-SPQ (DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları için Tarama Anketi), 
kişilik bozukluklarının varlığını taramak için kullanılan bir öz bildirim anketidir.

Bu anket, SCID-5-PD görüşmesi öncesinde kişilik bozukluğu özelliklerini taramak için kullanılır.
Hastalar tarafından doldurulabilir, ancak sonuçların ruh sağlığı uzmanı tarafından değerlendirilmesi gerekir.
`;

export const scid5SpqTest: Test = {
  id: 'scid-5-spq',
  name: 'SCID-5-SPQ (Kişilik Bozuklukları için Tarama Anketi)',
  description: scid5SpqIntro,
  infoText: 'Bu anket, kişilik bozukluğu özelliklerini taramak için kullanılır.',
  
  questions: [
    {
      id: 'SPQ1',
      text: 'Çok insanla uğraşmanızı gerekdirecek işlerden ya da görevlerden kaçınıyor musunuz?',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ2',
      text: 'Sizi seveceklernden emin olmadıkça insanlarla arkadaşlık kurmakdan kaçınıyor musunuz?',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ3',
      text: 'Yakın olduğunuz insanlara bile "açık" olmakta güçlük çeker misiniz?',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ4',
      text: 'Toplumsal durumlarda eleştirleceğinizden ya da dışlanacağınızdan sık sık kaygılandığınız olur mu?',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ105',
      text: '13 yaşınızdan önce, sıklıkla, evde olmanızın beklendiği saatlerden çok sonrasına, çok geç saatlere dek dışarıda kaldığınız oldu mu?',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    },
    {
      id: 'SPQ106',
      text: '13 yaşınızdan önce, sık sık okuldan kaçar mıydınız?',
      options: [
        { value: 0, text: 'Hayır' },
        { value: 1, text: 'Evet' },
        { value: 2, text: 'Bilmiyorum' }
      ]
    }
  ],
  
  calculateScore: (answers) => {
    return Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  },
  
  interpretScore: (score) => {
    return 'Değerlendirme tamamlandı';
  },
  
  generateReport: (answers) => {
    const totalScore = Object.values(answers).reduce((sum, value) => sum + (Number(value) || 0), 0);
    
    return {
      score: totalScore,
      severityLevel: 'Değerlendirme tamamlandı',
      factorScores: {},
      factorAverages: {},
      riskFactors: [],
      requiresTreatment: false
    };
  }
}; 