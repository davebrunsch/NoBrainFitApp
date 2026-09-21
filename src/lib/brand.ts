export const Brand = {
  // Backgrounds — « fond d'acier »
  bgVoid: '#0B0B0F',
  bgSurface: '#101015',
  bgCard: '#16161B',
  bgCardHi: '#1C1C22',

  // Accent unique « Lume »
  lume: '#C4ED4A',
  lime: '#C4ED4A',
  blue: '#C4ED4A',
  orange: '#C4ED4A',

  // Steel & graphite
  acier: '#D8D8DE',
  titane: '#86868F',
  graphite: '#55555E',

  // Neutrals
  white: '#F2F2F4',
  grey1: '#9A9AA4',
  grey2: '#55555E',
  grey3: '#2A2A32',

  // Borders
  border: 'rgba(255, 255, 255, 0.07)',
  border2: 'rgba(255, 255, 255, 0.14)',

  // Fonts
  fontHead: 'Space Grotesk, sans-serif',
  fontMono: 'Space Mono, monospace',
} as const;

export const SEX_LABELS = {
  male: 'Homme',
  female: 'Femme',
} as const;

export const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Débutant', sub: 'Je commence ou je reprends' },
  { id: 'intermediate', label: 'Intermédiaire', sub: 'Je m\'entraîne régulièrement' },
  { id: 'advanced', label: 'Confirmé', sub: 'Plusieurs années d\'expérience' },
] as const;

export const LIFESTYLES = [
  { id: 'sedentary', label: 'Sédentaire', sub: 'Bureau, peu de marche', factor: 1.2 },
  { id: 'light', label: 'Peu actif', sub: 'Un peu de marche / debout', factor: 1.375 },
  { id: 'active', label: 'Actif', sub: 'Travail physique ou sport régulier', factor: 1.55 },
  { id: 'veryActive', label: 'Très actif', sub: 'Sport intense ou métier très physique', factor: 1.725 },
] as const;

export const GOALS = [
  { id: 'loseFat', label: 'Perdre du gras', sub: 'Sécher, perdre du poids', kcalDelta: -450 },
  { id: 'buildMuscle', label: 'Prendre du muscle', sub: 'Gagner en masse et en volume', kcalDelta: 350 },
  { id: 'recomposition', label: 'Me recomposer', sub: 'Perdre du gras et gagner du muscle', kcalDelta: -150 },
  { id: 'maintain', label: 'Rester en forme', sub: 'Entretenir ma condition physique', kcalDelta: 0 },
  { id: 'performance', label: 'Performer', sub: 'Force, endurance, dépassement', kcalDelta: 150 },
] as const;

export const EQUIPMENTS = [
  { id: 'bodyweight', label: 'Poids de corps', sub: 'Aucun matériel, juste mon corps' },
  { id: 'dumbbells', label: 'Haltères', sub: 'Quelques haltères à la maison' },
  { id: 'machines', label: 'Machines guidées', sub: 'Machines guidées à dispo' },
  { id: 'fullGym', label: 'Salle complète', sub: 'Salle équipée, tout le matériel' },
] as const;
