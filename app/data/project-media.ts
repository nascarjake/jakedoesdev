export type ProjectMediaEntry = {
  shots: { src: string; caption: string }[];
  note: string;
  website?: string;
  video?: string;
};
const shot = (path: string, caption: string) => ({ src: `/projects/${path}.webp`, caption });

export const projectMedia: Record<string, ProjectMediaEntry> = {
  traxo: {
    shots: [shot('traxo/overview', 'Traxo mobile — archived product overview'), shot('traxo/itinerary', 'The itinerary view'), shot('traxo/flight', 'Flight details and travel alerts')],
    note: 'Original mobile product imagery. The company website reflects Traxo today.',
    website: 'https://traxo.com',
  },
  'trails-end': {
    shots: [shot('trails-end/dashboard', 'Scout sales dashboard'), shot('trails-end/overview', 'Archived Trail’s End app promotion and online sales workflow')],
    note: 'A popcorn fundraising app for Boy Scouts of America scouts and leaders. Supplied archival imagery.',
  },
  callsmart: {
    shots: [],
    note: 'Callahan Roach CallSmart later became ProfitRhino. Original app screenshots are not available; this entry documents the shipped work without recreating its interface.',
  },
  'foodtronix-mobile-pos': {
    shots: [shot('foodtronix/hardware', 'FoodTronix product and point-of-sale hardware')],
    note: 'Supplied product image for context, not a screenshot of the original 2011–2012 mobile application.',
  },
  'dm-auto-leasing': {
    shots: [shot('dm-leasing/logo', 'D&M Leasing brand mark')],
    note: 'Archived mobile project. The app is no longer on Google Play. Brand artwork is shown in place of an app screenshot.',
    website: 'https://www.dmautoleasing.com',
  },
  ziprad: {
    shots: [], video: 'fXm5drN--C0', website: 'https://www.zipdatasolutions.com',
    note: 'Product video supplied for this archive. Visit ZipData Solutions for current company information.',
  },
  ezforms: {
    shots: [shot('ezforms/dashboard', 'EZFORMS — scheduled forms and daily task dashboard'), shot('ezforms/login', 'Archived mobile sign-in screen'), shot('ezforms/logo', 'EZFORMS — Checklist & Audit Compliance')],
    note: 'Archived product imagery. The original EZFORMS website is no longer available.',
  },
  'stream-elixir': {
    shots: [shot('stream-elixir/dashboard', 'Stream Elixir desktop — session activity and messaging tools')],
    video: 'pK2DNWlO8j4', note: 'Original desktop interface and supplied product walkthrough.',
  },
  tradelab: {
    shots: [], video: 'c5mejriB_6U', note: 'TradeLab.ai product walkthrough.',
  },
};

export const ezformsClients = [
  { name: 'FedEx', image: 'fedex.png' },
  { name: 'Taco Bueno', image: 'taco-bueno.png' },
  { name: 'Dave & Buster’s', image: 'dave-and-busters.png' },
  { name: '[yellow tail]', image: 'yellow-tail.svg' },
  { name: 'Boy Scouts of America', image: 'bsa.svg' },
];
