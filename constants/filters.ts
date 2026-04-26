
export interface FilterPreset {
  id: string;
  name: string;
  overlayColor: string;
  overlayOpacity: number;
  isGrayscale?: boolean; 
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "normal", name: "Normal",  overlayColor: "transparent", overlayOpacity: 0 },
//   { id: "bw",     name: "B&W",     overlayColor: "transparent", overlayOpacity: 0, isGrayscale: true },
  { id: "warm",   name: "Warm",    overlayColor: "rgba(255,160,50,1)",  overlayOpacity: 0.25 },
  { id: "cool",   name: "Cool",    overlayColor: "rgba(50,100,255,1)",  overlayOpacity: 0.22 },
  { id: "fade",   name: "Fade",    overlayColor: "rgba(255,255,255,1)", overlayOpacity: 0.35 },
  { id: "drama",  name: "Drama",   overlayColor: "rgba(0,0,0,1)",       overlayOpacity: 0.25 },
  { id: "rose",   name: "Rose",    overlayColor: "rgba(220,60,120,1)",  overlayOpacity: 0.18 },
  { id: "dusk",   name: "Dusk",    overlayColor: "rgba(100,0,180,1)",   overlayOpacity: 0.2  },
];