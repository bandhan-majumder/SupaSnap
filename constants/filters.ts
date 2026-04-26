
export interface FilterPreset {
  id: string;
  name: string;
  overlayColor: string;
  overlayOpacity: number;
  isGrayscale?: boolean;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "normal",
    name: "Normal",
    overlayColor: "transparent",
    overlayOpacity: 0,
  },
  // {
  //   id: "bw",
  //   name: "B&W",
  //   overlayColor: "transparent",
  //   overlayOpacity: 0,
  //   isGrayscale: true,
  // },
  {
    id: "warm",
    name: "Warm",
    overlayColor: "rgba(255,160,50,1)",
    overlayOpacity: 0.25,
  },
  {
    id: "cool",
    name: "Cool",
    overlayColor: "rgba(50,100,255,1)",
    overlayOpacity: 0.22,
  },
  {
    id: "fade",
    name: "Fade",
    overlayColor: "rgba(255,255,255,1)",
    overlayOpacity: 0.35,
  },
  {
    id: "drama",
    name: "Drama",
    overlayColor: "rgba(0,0,0,1)",
    overlayOpacity: 0.25,
  },
  {
    id: "rose",
    name: "Rose",
    overlayColor: "rgba(220,60,120,1)",
    overlayOpacity: 0.18,
  },
  {
    id: "dusk",
    name: "Dusk",
    overlayColor: "rgba(100,0,180,1)",
    overlayOpacity: 0.2,
  },
  {
    id: "sunset",
    name: "Sunset",
    overlayColor: "rgba(255,120,60,1)",
    overlayOpacity: 0.3,
  },
  {
    id: "ocean",
    name: "Ocean",
    overlayColor: "rgba(0,150,200,1)",
    overlayOpacity: 0.25,
  },
  {
    id: "forest",
    name: "Forest",
    overlayColor: "rgba(40,120,60,1)",
    overlayOpacity: 0.22,
  },
  {
    id: "vintage",
    name: "Vintage",
    overlayColor: "rgba(200,170,120,1)",
    overlayOpacity: 0.3,
  },
  {
    id: "sepia",
    name: "Sepia",
    overlayColor: "rgba(112,66,20,1)",
    overlayOpacity: 0.35,
  },
  {
    id: "neon",
    name: "Neon",
    overlayColor: "rgba(0,255,180,1)",
    overlayOpacity: 0.18,
  },
  {
    id: "berry",
    name: "Berry",
    overlayColor: "rgba(180,0,90,1)",
    overlayOpacity: 0.22,
  },
  {
    id: "gold",
    name: "Golden",
    overlayColor: "rgba(255,200,80,1)",
    overlayOpacity: 0.28,
  },
  {
    id: "mint",
    name: "Mint",
    overlayColor: "rgba(120,255,200,1)",
    overlayOpacity: 0.2,
  },
  {
    id: "shadow",
    name: "Shadow",
    overlayColor: "rgba(0,0,0,1)",
    overlayOpacity: 0.4,
  },
  {
    id: "softpink",
    name: "Soft Pink",
    overlayColor: "rgba(255,180,200,1)",
    overlayOpacity: 0.22,
  },
  {
    id: "icy",
    name: "Icy",
    overlayColor: "rgba(180,220,255,1)",
    overlayOpacity: 0.25,
  },
  {
    id: "lava",
    name: "Lava",
    overlayColor: "rgba(255,60,0,1)",
    overlayOpacity: 0.3,
  },
  {
    id: "night",
    name: "Night",
    overlayColor: "rgba(10,20,60,1)",
    overlayOpacity: 0.35,
  },
];