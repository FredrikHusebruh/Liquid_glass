import img1 from './assets/salman-rameli-iyyH9CXmyBI-unsplash.jpg';
import img2 from './assets/andrew-dawes-KvC0Ic9uHdI-unsplash.jpg';
import img3 from './assets/stefan-steinbauer-YyWu19ab4_M-unsplash.jpg';
import img4 from './assets/ekamelev-RTDMLoPUyVI-unsplash.jpg';
import img5 from './assets/dominik-luckmann-gL8g-B1Wo2M-unsplash.jpg';
import img6 from './assets/gildardo-rh-q1-dAZuhs7I-unsplash.jpg';
import img7 from './assets/ezgif-71c5e27aeaa9bd67.gif';

export interface ImageEntry {
  id: string;
  label: string;
  src: string;
}

export const IMAGES: ImageEntry[] = [
  { id: '1', label: 'Spider',     src: img1 },
  { id: '2', label: 'Pen', src: img2 },
  { id: '3', label: 'Floral',   src: img3 },
  { id: '4', label: 'Lizard',     src: img4 },
  { id: '5', label: 'Bee',     src: img5 },
  { id: '6', label: 'Leaf',     src: img6 },
  { id: '7', label: 'Frog gif',     src: img7 },
];
