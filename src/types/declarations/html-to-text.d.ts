declare module 'html-to-text' {
  export interface HtmlToTextOptions {
    wordwrap?: number;
  }

  export function htmlToText(html: string, options?: HtmlToTextOptions): string;
}
