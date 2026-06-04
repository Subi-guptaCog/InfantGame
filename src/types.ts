/**
 * TypeScript type definitions for the Baby Sensory Game
 */

export type GameLevel = 1 | 2 | 3 | 4 | 5;

export interface SpawnedDog {
  id: string;
  x: number; // percentage of client width
  y: number; // percentage of client height
  photoUrl: string;
  rotation: number; // random tilt angle
  scale: number; // animation pop scale
  breedName: string;
  emoji?: string;
  bgColor?: string;
}

export interface FloatingBubble {
  id: string;
  x: number; // percentage x (0 to 100)
  y: number; // position from bottom in pixels
  size: number; // size in pixels
  color: string; // Tailwind bg-color or direct hex
  speed: number; // rising speed
  emoji: string; // surprise emoji when popped
}

export interface GameShape {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  color: string;
  label: string;
  icon: string;
}

export interface QuizQuestion {
  targetShapeType: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  promptText: string;
  options: GameShape[];
}

export interface RippleEffect {
  id: string;
  x: number;
  y: number;
  color: string;
}
