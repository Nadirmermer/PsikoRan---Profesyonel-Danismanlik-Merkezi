interface Test {
  id: string;
  name: string;
  description: string;
  category: string;
  reference?: string;
}

export const AVAILABLE_TESTS: Test[] = [
  {
    id: 'beck-depression',
    name: 'Beck Depresyon Envanteri',
    description: 'Depresyon belirtilerinin şiddetini ölçen 21 maddelik bir öz bildirim ölçeği.',
    category: 'depression'
  },
  {
    id: 'edinburgh',
    name: 'Edinburgh Doğum Sonrası Depresyon Ölçeği',
    description: 'Doğum sonrası depresyon riskini değerlendiren 10 maddelik bir ölçek.',
    category: 'depression'
  },
  {
    id: 'beck-anxiety',
    name: 'Beck Anksiyete Envanteri',
    description: 'Anksiyete belirtilerinin şiddetini ölçen 21 maddelik bir öz bildirim ölçeği.',
    category: 'anxiety'
  },
  {
    id: 'yaygin-anksiyete',
    name: 'Yaygın Anksiyete Bozukluğu-7 Testi (GAD-7)',
    description: 'Bireylerdeki yaygın anksiyete belirtilerini taramak amacıyla kullanılan 7 soruluk bir özbildirim aracı.',
    category: 'anxiety'
  },
  {
    id: 'child-social-anxiety',
    name: 'Çocuklar için Sosyal Anksiyete Ölçeği (Yenilenmiş Biçim)',
    description: 'Çocuklarda sosyal anksiyete belirtilerini değerlendiren bir ölçek.',
    category: 'anxiety'
  },
  {
    id: 'scid-5-cv',
    name: 'SCID-5-CV',
    description: 'DSM-5 için Yapılandırılmış Klinik Görüşme - Klinik Versiyon.',
    category: 'personality'
  },
  {
    id: 'scid-5-pd',
    name: 'SCID-5-PD',
    description: 'DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları.',
    category: 'personality'
  },
  {
    id: 'scid-5-spq',
    name: 'SCID-5-SPQ',
    description: 'DSM-5 için Yapılandırılmış Klinik Görüşme - Kişilik Bozuklukları Tarama Anketi.',
    category: 'personality'
  },
  {
    id: 'beck-hopelessness',
    name: 'Beck Umutsuzluk Ölçeği',
    description: 'Bireyin geleceğe yönelik olumsuz beklentilerini ölçen 20 maddelik bir ölçek.',
    category: 'other'
  },
  {
    id: 'beck-suicide',
    name: 'Beck İntihar Düşüncesi Ölçeği',
    description: 'İntihar düşüncelerinin şiddetini değerlendiren bir ölçek.',
    category: 'other'
  },
  {
    id: 'ytt40',
    name: 'YTT-40 Yeme Tutum Testi',
    description: 'Yeme bozukluklarını değerlendiren 40 maddelik bir ölçek.',
    category: 'other'
  },
  {
    id: 'scl90r',
    name: 'SCL-90-R Belirti Tarama Listesi',
    description: 'Çeşitli psikolojik belirtileri değerlendiren 90 maddelik bir ölçek.',
    category: 'other'
  },
  {
    id: 'toronto-aleksitimi',
    name: 'Toronto Aleksitimi Ölçeği (TAÖ)',
    description: 'Bireylerdeki aleksitimik özellikleri değerlendirmede kullanılan 26 maddelik bir özbildirim aracı.',
    category: 'emotion'
  },
  {
    id: 'aso',
    name: 'Algılanan Stres Ölçeği (ASÖ-14)',
    description: 'Kişilerin hayatlarındaki durumları ne derece stresli algıladığını ölçen 14 maddelik bir ölçek.',
    category: 'stress'
  },
  {
    id: 'acyo',
    name: 'Arizona Cinsel Yaşantılar Ölçeği (ACYÖ)',
    description: 'Cinsel işlevin beş temel bileşenini değerlendiren, kadın ve erkek formları bulunan bir ölçek.',
    category: 'sexual'
  },
  {
    id: 'bdo',
    name: 'Bilişsel Duygu Düzenleme Ölçeği',
    description: 'Stres veren yaşam olayları sonrasında kişilerin kullandığı bilişsel duygu düzenleme stratejilerini ölçmeyi amaçlayan bir değerlendirme aracı.',
    category: 'emotion'
  },
  {
    id: 'conners-parent',
    name: 'Conners Ebeveyn Derecelendirme Ölçeği (CADÖ-48)(BİTMEDİ)',
    description: 'Yıkıcı davranış bozukluklarının taranması amacıyla geliştirilmiş ebeveynler tarafından doldurulan bir ölçek.',
    category: 'children'
  }
]; 