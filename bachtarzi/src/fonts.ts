import {continueRender, delayRender, staticFile} from 'remotion';

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

type Face = [family: string, file: string, weight: string, style: string, range?: string];

const latin = (family: string, slug: string, weight: string, style: string): Face[] => [
  [family, `${slug}-latin-${weight}-${style}`, weight, style, LATIN],
  [family, `${slug}-latin-ext-${weight}-${style}`, weight, style, LATIN_EXT],
];

const FACES: Face[] = [
  ...latin('EB Garamond', 'eb-garamond', '500', 'normal'),
  ...latin('EB Garamond', 'eb-garamond', '600', 'normal'),
  ...latin('EB Garamond', 'eb-garamond', '700', 'normal'),
  ...latin('EB Garamond', 'eb-garamond', '500', 'italic'),
  ...latin('Inter', 'inter', '500', 'normal'),
  ...latin('Inter', 'inter', '600', 'normal'),
  ['Amiri', 'amiri-arabic-400-normal', '400', 'normal'],
  ['Amiri', 'amiri-arabic-700-normal', '700', 'normal'],
  ['Aref Ruqaa', 'aref-ruqaa-arabic-700-normal', '700', 'normal'],
];

let started = false;

// Loads every face before the first frame is captured.
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    FACES.map(([family, file, weight, style, unicodeRange]) => {
      const face = new FontFace(family, `url('${staticFile(`fonts/${file}.woff2`)}') format('woff2')`, {
        weight,
        style,
        ...(unicodeRange ? {unicodeRange} : {}),
      });
      (document.fonts as unknown as Set<FontFace>).add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
