import { beckDepressionTest } from './beck-depression';
import { beckAnxietyTest } from './beck-anxiety';
import { beckHopelessnessTest } from './beck-hopelessness';
import { beckSuicideTest } from './beck-suicide';
import { childSocialAnxietyTest } from './child-social-anxiety';
import { ytt40Test } from './ytt40';
import { scl90rTest } from './scl90r';
import { edinburghTest } from './edinburgh';
import { scid5CvTest } from './scid-5-cv';
import { scid5PdTest } from './scid-5-pd';
import { scid5SpqTest } from './scid-5-spq';

// Tüm testleri dışa aktarıyoruz
export {
  beckDepressionTest,
  beckAnxietyTest,
  beckHopelessnessTest,
  beckSuicideTest,
  childSocialAnxietyTest,
  ytt40Test,
  scl90rTest,
  edinburghTest,
  scid5CvTest,
  scid5PdTest,
  scid5SpqTest
};

// Kullanılabilir testler listesi
export const AVAILABLE_TESTS = [
  beckDepressionTest,
  beckAnxietyTest,
  beckHopelessnessTest,
  beckSuicideTest,
  childSocialAnxietyTest,
  ytt40Test,
  scl90rTest,
  edinburghTest,
  scid5CvTest,
  scid5PdTest,
  scid5SpqTest
]; 