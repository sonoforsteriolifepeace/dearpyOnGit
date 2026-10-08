export const W = 1920;
export const H = 1080;

export const C = {
  cream: '#F3E9D1',
  creamDim: 'rgba(243,233,209,0.66)',
  creamSoft: 'rgba(243,233,209,0.34)',
  creamFaint: 'rgba(243,233,209,0.14)',
  gold: '#E6B65A',
  goldDeep: '#B98A32',
  goldSoft: 'rgba(230,182,90,0.22)',
  terra: '#E4693F',
  teal: '#79CBB9',
  blue: '#8FC3DA',
  night: 'rgba(5,10,10,0.55)',
};

// [bord, centre] du dégradé de fond, par partie : vert nuit → indigo → ocre brûlé
export const BG: Record<1 | 2 | 3, [string, string]> = {
  1: ['#071A17', '#12413A'],
  2: ['#100E29', '#2D2672'],
  3: ['#1F0D09', '#63301B'],
};

export const FONT = {
  serif: "'Cormorant Garamond', 'Times New Roman', serif",
  sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  ar: "'Amiri', 'Noto Naskh Arabic', serif",
  kufi: "'Reem Kufi', 'Amiri', sans-serif",
};
