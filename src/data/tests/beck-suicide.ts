import { Test } from './types';

// Test başlangıç açıklaması
export const beckSuicideIntro = `
Aşağıda, kişilerin intiharla ilgili düşünce ve davranışlarını ifade eden bazı cümleler verilmiştir. 
Lütfen her ifadeyi dikkatle okuyunuz ve size en uygun olan seçeneği işaretleyiniz.

Her bir madde 0-2 arasında puanlanmaktadır. Ölçek beş bölümden oluşur:
I. Yaşam ve Ölüme Dair Tutumun Özellikleri (1-5. maddeler)
II. İntihar Düşüncesi ve Arzusunun Özellikleri (6-11. maddeler)
III. Tasarlanan Girişimin Özellikleri (12-15. maddeler)
IV. Tasarlanan Girişimin Gerçekleştirilmesi (16-19. maddeler)
V. Arka Plan Faktörleri (20-21. maddeler)

Arka plan faktörleri genel değerlendirmeye alınmamaktadır. En düşük puan 0, en yüksek puan 38 olup, puanın yüksek olması intihar düşüncesinin belirgin ve ciddi olması anlamına gelmektedir.
`;

// Puan aralıklarına göre intihar riskini belirleyen yardımcı fonksiyon
const getSuicideRiskLevel = (score: number): string => {
  if (score >= 0 && score <= 8) {
    return 'Düşük düzeyde intihar riski';
  } else if (score >= 9 && score <= 19) {
    return 'Orta düzeyde intihar riski';
  } else if (score >= 20 && score <= 38) {
    return 'Yüksek düzeyde intihar riski';
  }
  return 'Değerlendirme tamamlandı';
};

export const beckSuicideTest: Test = {
  id: 'beck-suicide',
  name: 'Beck İntihar Düşüncesi Ölçeği',
  description: beckSuicideIntro,
  infoText: 'Bu ölçek, kişilerin intihar düşüncelerini beş farklı boyutta değerlendirmek için kullanılır. Arka plan faktörleri (20-21. maddeler) genel değerlendirmeye alınmamaktadır.',
  reference: 'https://psikiyatri.org.tr/uploadFiles/BECK_INTHAR.doc',
  
  questions: [
    {
      id: 'BS1',
      text: 'Yaşama arzusu',
      options: [
        { value: 0, text: 'Orta veya şiddetli' },
        { value: 1, text: 'Zayıf' },
        { value: 2, text: 'Yok' }
      ]
    },
    {
      id: 'BS2',
      text: 'Ölme arzusu',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Zayıf' },
        { value: 2, text: 'Orta veya şiddetli' }
      ]
    },
    {
      id: 'BS3',
      text: 'Yaşam / Ölüm için nedenler',
      options: [
        { value: 0, text: 'Yaşam ölümden ağır basmakta' },
        { value: 1, text: 'Yaşam ve ölüm için nedenler eşit' },
        { value: 2, text: 'Ölmek yaşamaktan ağır basıyor' }
      ]
    },
    {
      id: 'BS4',
      text: 'Aktif intihar girişiminde bulunma arzusu',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Zayıf' },
        { value: 2, text: 'Orta veya şiddetli' }
      ]
    },
    {
      id: 'BS5',
      text: 'Pasif İntihar girişimi',
      options: [
        { value: 0, text: 'Yaşamı korumak için intihar girişimi' },
        { value: 1, text: 'Yaşamayı ölmeyi şansa bırakabilir' },
        { value: 2, text: 'Hayatını korumak ve sürdürmek için önlemlerden kaçınma' }
      ]
    },
    {
      id: 'BS6',
      text: 'İntihar düşüncesinin/isteğinin süresi',
      options: [
        { value: 0, text: 'Kısa ve geçici dönemler' },
        { value: 1, text: 'Uzun dönemler' },
        { value: 2, text: 'Kronik veya hemen daima sürekli' }
      ]
    },
    {
      id: 'BS7',
      text: 'İntihar düşüncesinin sıklığı',
      options: [
        { value: 0, text: 'Nadiren' },
        { value: 1, text: 'Aralıklı' },
        { value: 2, text: 'Sebat eden veya süregen' }
      ]
    },
    {
      id: 'BS8',
      text: 'Düşünce ve isteğe karşı tutum',
      options: [
        { value: 0, text: 'Kabul etmeyen' },
        { value: 1, text: 'Ambivalan, tepkisiz' },
        { value: 2, text: 'Kabul eden' }
      ]
    },
    {
      id: 'BS9',
      text: 'İntihar davranışını / Acting outu kontrol etme arzusu',
      options: [
        { value: 0, text: 'Kontrol etme duygusu mevcut' },
        { value: 1, text: 'Kontrol edeceğinden emin değil' },
        { value: 2, text: 'Kontrol etme duygusu yok' }
      ]
    },
    {
      id: 'BS10',
      text: 'Aktif girişimden caydırıcı etmenler (din, aile, başarılı olmayan ciddi hasar, geri dönüş yok)',
      options: [
        { value: 0, text: 'Caydırıcılar sebebi ile intihar etmeme' },
        { value: 1, text: 'Caydırıcılar hakkında biraz ilgi gösterme' },
        { value: 2, text: 'Caydırıcılar hakkında hiç ya da minimal ilgi taşıma' }
      ]
    },
    {
      id: 'BS11',
      text: 'Düşünülen girişim için sebep',
      options: [
        { value: 0, text: 'Çevreyi etkilemek, dikkat çekmek, intikam' },
        { value: 1, text: '0 ve 2 nin kombinasyonu' },
        { value: 2, text: 'Problemden kaçma, çözmek, tamamen sona erdirmek' }
      ]
    },
    {
      id: 'BS12',
      text: 'Yöntem: Özgüllük ve Planlama',
      options: [
        { value: 0, text: 'Dikkate alınmama' },
        { value: 1, text: 'Dikkate alınmış fakat detaylar çalışılmamış' },
        { value: 2, text: 'Detaylar çalışılmış ve çok iyi planlanmış' }
      ]
    },
    {
      id: 'BS13',
      text: 'Yöntem: Erişilebilirlik',
      options: [
        { value: 0, text: 'Yönteme ulaşamıyor, fırsat yok' },
        { value: 1, text: 'Yöntem zaman ve çaba istiyor, fırsat gerçekten yok' },
        { value: 2, text: 'Yöntem ve fırsata erişilebilir' }
      ]
    },
    {
      id: 'BS14',
      text: 'Girişimi gerçekleştirme yeteneğine ilişkin duyumları olması',
      options: [
        { value: 0, text: 'Cesaret yok, korkmuş, çok zayıf, yeteneksiz' },
        { value: 1, text: 'Cesaret konusunda emin değil, yeteneği var' },
        { value: 2, text: 'Yeteneği ve cesareti var' }
      ]
    },
    {
      id: 'BS15',
      text: 'Gerçek girişimin beklentisi / öngörüsü',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Belirsiz, emin değil' },
        { value: 2, text: 'Evet' }
      ]
    },
    {
      id: 'BS16',
      text: 'Gerçek Hazırlık',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Kısmen' },
        { value: 2, text: 'Tam' }
      ]
    },
    {
      id: 'BS17',
      text: 'İntihar Notu',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Başlamış fakat tamamlamamış yada bırakmamış, sadece düşünce' },
        { value: 2, text: 'Tamamlamış, bırakmış' }
      ]
    },
    {
      id: 'BS18',
      text: 'Ölüm beklentisi içinde yapılan son hareketler',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: 'Düşünmüş ve bazı düzenlemeler yapmış' },
        { value: 2, text: 'Kesin planlar yapmış ya da düzenlemeleri tamamlamış' }
      ]
    },
    {
      id: 'BS19',
      text: 'Tasarlanan girişimin gizlenmesi ya da aldatıcı bir tavır sergilenmesi',
      options: [
        { value: 0, text: 'Tasarıları açıkça belli etmek' },
        { value: 1, text: 'Açıklamaktan çekinmek' },
        { value: 2, text: 'Yalan söyleme, aldatma, gizli tutma girişimlerinde bulunur' }
      ]
    },
    {
      id: 'BS20',
      text: 'Önceki intihar girişimi',
      options: [
        { value: 0, text: 'Yok' },
        { value: 1, text: '1' },
        { value: 2, text: 'Birden fazla' }
      ]
    },
    {
      id: 'BS21',
      text: 'Son girişimle ilgili ölme eğilimi',
      options: [
        { value: 0, text: 'Düşük' },
        { value: 1, text: 'Orta derecede, ikilemli, emin değil' },
        { value: 2, text: 'Yüksek' }
      ]
    }
  ],
  
  calculateScore: (answers) => {
    // Arka plan faktörleri (BS20 ve BS21) hariç tüm soruların puanlarını topla
    return Object.entries(answers)
      .filter(([key]) => key !== 'BS20' && key !== 'BS21')
      .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
  },
  
  interpretScore: (score) => {
    return getSuicideRiskLevel(score);
  },
  
  generateReport: (answers) => {
    // Ana puanı hesapla (Arka plan faktörleri hariç)
    const mainScore = Object.entries(answers)
      .filter(([key]) => key !== 'BS20' && key !== 'BS21')
      .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
    
    // Alt bölüm puanlarını hesapla
    const factorScores = {
      yasam_olum_tutum: ['BS1', 'BS2', 'BS3', 'BS4', 'BS5'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      intihar_dusuncesi: ['BS6', 'BS7', 'BS8', 'BS9', 'BS10', 'BS11'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      tasarlanan_girisim: ['BS12', 'BS13', 'BS14', 'BS15'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      girisim_gerceklestirme: ['BS16', 'BS17', 'BS18', 'BS19'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0),
      arka_plan_faktorleri: ['BS20', 'BS21'].reduce((sum, id) => sum + (Number(answers[id]) || 0), 0)
    };
    
    // Alt bölüm ortalamalarını hesapla
    const factorAverages = {
      yasam_olum_tutum: factorScores.yasam_olum_tutum / 5,
      intihar_dusuncesi: factorScores.intihar_dusuncesi / 6,
      tasarlanan_girisim: factorScores.tasarlanan_girisim / 4,
      girisim_gerceklestirme: factorScores.girisim_gerceklestirme / 4,
      arka_plan_faktorleri: factorScores.arka_plan_faktorleri / 2
    };
    
    const severityLevel = getSuicideRiskLevel(mainScore);
    
    return {
      score: mainScore,
      severityLevel: severityLevel,
      factorScores: factorScores,
      factorAverages: factorAverages,
      riskFactors: [],
      requiresTreatment: false
    };
  }
}; 