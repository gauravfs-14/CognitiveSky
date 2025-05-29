declare module "@visx/wordcloud" {
  import * as React from "react";

  export interface WordDatum {
    text: string;
    value: number;
  }

  export interface WordcloudProps {
    words: WordDatum[];
    width: number;
    height: number;
    fontSize?: (datum: WordDatum) => number;
    rotate?: (datum: WordDatum) => number;
    fill?: (datum: WordDatum, i: number) => string;
    padding?: number;
  }

  export const Wordcloud: React.FC<WordcloudProps>;
}
