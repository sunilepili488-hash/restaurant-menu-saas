export const SCROLL_ANIMATION_STYLES = [
  { id: 'fade-up', label: 'Fade Up', description: 'Cards gently fade and rise into place' },
  { id: 'zoom-in', label: 'Zoom In', description: 'Cards scale up from a slight zoom' },
  { id: 'slide-fade', label: 'Slide Fade', description: 'Cards slide in from the side while fading in' },
  { id: 'flip', label: 'Flip Reveal', description: 'Cards flip into view along the X axis' },
];

export function getScrollVariants(style = 'fade-up') {
  switch (style) {
    case 'zoom-in':
      return {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      };
    case 'slide-fade':
      return {
        initial: { opacity: 0, x: -24 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      };
    case 'flip':
      return {
        initial: { opacity: 0, rotateX: 35, y: 20 },
        animate: { opacity: 1, rotateX: 0, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      };
    case 'fade-up':
    default:
      return {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      };
  }
}
