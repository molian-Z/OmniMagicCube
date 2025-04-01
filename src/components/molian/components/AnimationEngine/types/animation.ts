export interface EffectProperty {
  [key: string]: string | number | undefined;
}

export interface EffectTo {
  opacity?: number;
  scale?: number;
  rotation?: number;
  x?: number;
  y?: number;
  [key: string]: any;
}

export interface AnimationEffect {
  type: string;
  duration: number;
  delay: number;
  ease: string;
  direction?: string;
  to?: EffectTo;
  from?: EffectTo;
  properties?: EffectProperty;
}