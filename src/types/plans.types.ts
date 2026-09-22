export enum Plan {
  Anonymous = 'ANONYMOUS',
  Free = 'FREE',
  Premium = 'PREMIUM',
}

export enum Feature {
  JoinGame = 'JOIN_GAME',
  CreateGame = 'CREATE_GAME',
}

export interface FeatureMetadataMap {
  [Feature.JoinGame]: {
    access: boolean;
  };
  [Feature.CreateGame]: {
    access: boolean;
    canUseTemplates: boolean;
    canCustomize: boolean;
    maxSeats: number;
  };
}
