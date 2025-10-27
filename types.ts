
export type AspectRatio = '16:9' | '9:16';

export interface GroundingChunk {
  maps: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        uri: string;
        title: string;
        snippet: string;
      }[];
    };
  };
}
