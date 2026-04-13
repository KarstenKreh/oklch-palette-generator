/**
 * Curated icon set definitions with visual personality tags.
 * Each family can have multiple style variants.
 */

export type IconSetStyle = 'outlined' | 'filled' | 'duotone';
export type IconSetWeight = 'thin' | 'regular' | 'bold';
export type IconSetCorners = 'sharp' | 'rounded' | 'mixed';

export interface IconSetVariant {
  id: string;
  style: IconSetStyle;
  strokeWeight: IconSetWeight;
  label: string;
}

export interface IconFamily {
  id: string;
  name: string;
  iconifyPrefix: string;
  cornerStyle: IconSetCorners;
  mood: number;
  description: string;
  url: string;
  npmPackage: string;
  license: string;
  variants: IconSetVariant[];
  defaultVariant: string;
}

export const ICON_FAMILIES: IconFamily[] = [
  {
    id: 'material',
    name: 'Material Symbols',
    iconifyPrefix: 'material-symbols',
    cornerStyle: 'sharp',
    mood: 25,
    description: 'Geometric, authoritative, and systematic.',
    url: 'https://fonts.google.com/icons',
    npmPackage: '@iconify-json/material-symbols',
    license: 'Apache 2.0',
    defaultVariant: 'material-outlined',
    variants: [
      { id: 'material-outlined', style: 'outlined', strokeWeight: 'regular', label: 'Outlined' },
      { id: 'material-filled', style: 'filled', strokeWeight: 'regular', label: 'Filled' },
    ],
  },
  {
    id: 'lucide',
    name: 'Lucide',
    iconifyPrefix: 'lucide',
    cornerStyle: 'rounded',
    mood: 60,
    description: 'Friendly, consistent, and approachable.',
    url: 'https://lucide.dev',
    npmPackage: 'lucide-react',
    license: 'ISC',
    defaultVariant: 'lucide',
    variants: [
      { id: 'lucide', style: 'outlined', strokeWeight: 'regular', label: 'Outlined' },
    ],
  },
  {
    id: 'phosphor',
    name: 'Phosphor',
    iconifyPrefix: 'ph',
    cornerStyle: 'rounded',
    mood: 55,
    description: 'Warm, versatile, and expressive.',
    url: 'https://phosphoricons.com',
    npmPackage: '@phosphor-icons/react',
    license: 'MIT',
    defaultVariant: 'phosphor-regular',
    variants: [
      { id: 'phosphor-regular', style: 'outlined', strokeWeight: 'regular', label: 'Regular' },
      { id: 'phosphor-bold', style: 'outlined', strokeWeight: 'bold', label: 'Bold' },
      { id: 'phosphor-thin', style: 'outlined', strokeWeight: 'thin', label: 'Thin' },
      { id: 'phosphor-fill', style: 'filled', strokeWeight: 'regular', label: 'Fill' },
    ],
  },
  {
    id: 'solar',
    name: 'Solar',
    iconifyPrefix: 'solar',
    cornerStyle: 'rounded',
    mood: 75,
    description: 'Expressive, modern, with a distinctive broken-line variant.',
    url: 'https://solar-icons.com',
    npmPackage: '@iconify-json/solar',
    license: 'CC BY 4.0',
    defaultVariant: 'solar-linear',
    variants: [
      { id: 'solar-linear', style: 'outlined', strokeWeight: 'thin', label: 'Linear' },
      { id: 'solar-bold', style: 'outlined', strokeWeight: 'bold', label: 'Bold' },
      { id: 'solar-broken', style: 'outlined', strokeWeight: 'thin', label: 'Broken' },
    ],
  },
  {
    id: 'radix',
    name: 'Radix Icons',
    iconifyPrefix: 'radix-icons',
    cornerStyle: 'sharp',
    mood: 40,
    description: 'Precise, minimal, designed on a 15px grid.',
    url: 'https://www.radix-ui.com/icons',
    npmPackage: '@radix-ui/react-icons',
    license: 'MIT',
    defaultVariant: 'radix',
    variants: [
      { id: 'radix', style: 'outlined', strokeWeight: 'thin', label: 'Regular' },
    ],
  },
];

/** Flat list of all variants (for export/recommend compatibility) */
export interface IconSetDefinition {
  id: string;
  name: string;
  familyId: string;
  iconifyPrefix: string;
  style: IconSetStyle;
  strokeWeight: IconSetWeight;
  cornerStyle: IconSetCorners;
  mood: number;
  description: string;
  url: string;
  npmPackage: string;
  license: string;
}

export const ICON_SETS: IconSetDefinition[] = ICON_FAMILIES.flatMap((f) =>
  f.variants.map((v) => ({
    id: v.id,
    name: f.variants.length > 1 ? `${f.name} ${v.label}` : f.name,
    familyId: f.id,
    iconifyPrefix: f.iconifyPrefix,
    style: v.style,
    strokeWeight: v.strokeWeight,
    cornerStyle: f.cornerStyle,
    mood: f.mood,
    description: f.description,
    url: f.url,
    npmPackage: f.npmPackage,
    license: f.license,
  }))
);

export function getSetById(id: string): IconSetDefinition | undefined {
  return ICON_SETS.find((s) => s.id === id);
}

export function getFamilyById(id: string): IconFamily | undefined {
  return ICON_FAMILIES.find((f) => f.id === id);
}

export function getFamilyForVariant(variantId: string): IconFamily | undefined {
  return ICON_FAMILIES.find((f) => f.variants.some((v) => v.id === variantId));
}
