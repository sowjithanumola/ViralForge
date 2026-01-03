
export enum VideoPlatform {
  YouTube = 'YouTube',
  Shorts = 'Shorts',
  Reels = 'Reels',
  TikTok = 'TikTok'
}

export enum VideoStyle {
  Educational = 'Educational',
  Entertainment = 'Entertainment',
  Story = 'Story',
  Tutorial = 'Tutorial',
  Opinion = 'Opinion'
}

export interface UserData {
  platform: string;
  topic: string;
  audience: string;
  emotion: string;
  style: string;
  benefit: string;
}

export interface GenerationResult {
  titles: string[];
  hooks: string[];
  flow: string;
}

export type RefinementTone = 'shocking' | 'emotional' | 'professional';
