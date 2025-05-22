declare module 'sanitize-html' {
  interface IOptions {
    allowedTags?: string[] | false;
    allowedAttributes?: { [key: string]: string[] } | false;
    selfClosing?: string[];
    allowedSchemes?: string[];
    allowedSchemesByTag?: { [key: string]: string[] };
    allowedSchemesAppliedToAttributes?: string[];
    allowProtocolRelative?: boolean;
    enforceHtmlBoundary?: boolean;
    parseStyleAttributes?: boolean;
  }

  function sanitizeHtml(dirty: string, options?: IOptions): string;
  export = sanitizeHtml;
}