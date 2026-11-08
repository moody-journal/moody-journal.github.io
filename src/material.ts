import type { SoapBubbleMaterialProps } from './components/soap-bubble';
// User-selected dark website: catalog Rainbow glass defaults.
// Keep explicit lighting/reflection overrides, including glintIntensity: 0.
export const DARK_GLASS: SoapBubbleMaterialProps = {
  glass: 0.95, iridescence: 2, filmScale: 4.85, oilOpacity: 1,
  oilCoverage: 1, oilEdge: 18, oilEdgeFade: 1, clearCenter: 0.73,
  thickness: 480, drainage: 0.35, swirl: 0.5, reflectivity: 1.3,
  refraction: 0.15, dispersion: 1, bevel: 14,
  windowLength: 1.3, windowMargin: 0.85, windowBend: 0.75,
  windowSize: 0.75, windowWidth: 0.8, windowGradient: 0.96,
  windowHead: 0.7, windowTail: 0.6, glintSize: 1.65,
  glintIntensity: 0, glintDistance: -0.45, glintHeight: 0.65,
  windowIntensity: 0.85, windowTwin: false, bottomShadeColor: '#ffffff',
};
