import { beckDepressionTest } from './beck-depression';
import { beckAnxietyTest } from './beck-anxiety';
import { beckHopelessnessTest } from './beck-hopelessness';
import { beckSuicideTest } from './beck-suicide';
import { edinburghTest } from './edinburgh';
import { scid5CvTest } from './scid-5-cv';
import { scid5PdTest } from './scid-5-pd';
import { scid5SpqTest } from './scid-5-spq';
import { scl90rTest } from './scl90r';
import { ytt40Test } from './ytt40';
import { algılananStresTest } from './algılananStres';
import { arizonaCinselYasantilarTest } from './arizonaCinselYasantilar';
import { bilisselDuyguDuzenlemeTest } from './bilisselDuyguDuzenleme';
import { connersEbeveynTest } from './connersEbeveyn';
import { yayginAnksiyeteTest } from './yayginAnksiyete';
import { torontoAleksitimiTest } from './torontoAleksitimi';

// Test objeleri için bir map
export const TEST_MAP: Record<string, Promise<any>> = {
  'beck-depression': import('./beck-depression').then(m => m.beckDepressionTest),
  'beck-anxiety': import('./beck-anxiety').then(m => m.beckAnxietyTest),
  'beck-hopelessness': import('./beck-hopelessness').then(m => m.beckHopelessnessTest),
  'beck-suicide': import('./beck-suicide').then(m => m.beckSuicideTest),
  'edinburgh': import('./edinburgh').then(m => m.edinburghTest),
  'scid-5-cv': import('./scid-5-cv').then(m => m.scid5CvTest),
  'scid-5-pd': import('./scid-5-pd').then(m => m.scid5PdTest),
  'scid-5-spq': import('./scid-5-spq').then(m => m.scid5SpqTest),
  'scl90r': import('./scl90r').then(m => m.scl90rTest),
  'ytt40': import('./ytt40').then(m => m.ytt40Test),
  'aso': import('./algılananStres').then(m => m.algılananStresTest),
  'acyo': import('./arizonaCinselYasantilar').then(m => m.arizonaCinselYasantilarTest),
  'bdo': import('./bilisselDuyguDuzenleme').then(m => m.bilisselDuyguDuzenlemeTest),
  'conners-parent': import('./connersEbeveyn').then(m => m.connersEbeveynTest),
  'yaygin-anksiyete': import('./yayginAnksiyete').then(m => m.yayginAnksiyeteTest),
  'toronto-aleksitimi': import('./torontoAleksitimi').then(m => m.torontoAleksitimiTest)
};

// Temel test bilgilerini içeren bir meta-map (hızlı erişim için)
export const TEST_META = {
  'beck-depression': { id: 'beck-depression', name: 'Beck Depresyon Ölçeği' },
  'beck-anxiety': { id: 'beck-anxiety', name: 'Beck Anksiyete Ölçeği' },
  'beck-hopelessness': { id: 'beck-hopelessness', name: 'Beck Umutsuzluk Ölçeği' },
  'beck-suicide': { id: 'beck-suicide', name: 'Beck İntihar Düşüncesi Ölçeği' },
  'edinburgh': { id: 'edinburgh', name: 'Edinburgh Doğum Sonrası Depresyon Ölçeği' },
  'scid-5-cv': { id: 'scid-5-cv', name: 'SCID-5-CV Yapılandırılmış Klinik Görüşme' },
  'scid-5-pd': { id: 'scid-5-pd', name: 'SCID-5-PD Kişilik Bozuklukları' },
  'scid-5-spq': { id: 'scid-5-spq', name: 'SCID-5-SPQ Kişilik Ölçeği' },
  'scl90r': { id: 'scl90r', name: 'SCL-90-R Belirti Tarama Listesi' },
  'ytt40': { id: 'ytt40', name: 'Yaygın Tutum Testi' },
  'aso': { id: 'aso', name: 'Algılanan Stres Ölçeği' },
  'acyo': { id: 'acyo', name: 'Arizona Cinsel Yaşantılar Ölçeği' },
  'bdo': { id: 'bdo', name: 'Bilişsel Duygu Düzenleme Ölçeği' },
  'conners-parent': { id: 'conners-parent', name: 'Conners Ebeveyn Değerlendirme Ölçeği' },
  'yaygin-anksiyete': { id: 'yaygin-anksiyete', name: 'Yaygın Anksiyete Bozukluğu Ölçeği' },
  'toronto-aleksitimi': { id: 'toronto-aleksitimi', name: 'Toronto Aleksitimi Ölçeği' }
};

// Test listesi (arayüzde gösterilecek)
export const AVAILABLE_TESTS = [
  beckDepressionTest,
  beckAnxietyTest,
  beckHopelessnessTest,
  beckSuicideTest,
  edinburghTest,
  scid5CvTest,
  scid5PdTest,
  scid5SpqTest,
  scl90rTest,
  ytt40Test,
  algılananStresTest,
  arizonaCinselYasantilarTest,
  bilisselDuyguDuzenlemeTest,
  connersEbeveynTest,
  yayginAnksiyeteTest,
  torontoAleksitimiTest
];

// İçe aktarmaları yeniden dışa aktar
export { beckDepressionTest } from './beck-depression';
export { beckAnxietyTest } from './beck-anxiety';
export { beckHopelessnessTest } from './beck-hopelessness';
export { beckSuicideTest } from './beck-suicide';
export { edinburghTest } from './edinburgh';
export { scid5CvTest } from './scid-5-cv';
export { scid5PdTest } from './scid-5-pd';
export { scid5SpqTest } from './scid-5-spq';
export { scl90rTest } from './scl90r';
export { ytt40Test } from './ytt40';
export { algılananStresTest } from './algılananStres';
export { arizonaCinselYasantilarTest } from './arizonaCinselYasantilar';
export { bilisselDuyguDuzenlemeTest } from './bilisselDuyguDuzenleme';
export { connersEbeveynTest } from './connersEbeveyn';
export { yayginAnksiyeteTest } from './yayginAnksiyete';
export { torontoAleksitimiTest } from './torontoAleksitimi';
