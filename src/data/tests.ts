interface Test {
  id: string;
  name: string;
  description: string;
  category: string;
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
    id: 'child-social-anxiety',
    name: 'Çocuklar için Sosyal Anksiyete Ölçeği',
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
  }
]; 