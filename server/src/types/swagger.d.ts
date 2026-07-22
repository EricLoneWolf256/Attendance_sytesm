declare module "swagger-jsdoc" {
  interface SwaggerJsdocOptions {
    definition: {
      openapi?: string;
      info?: Record<string, unknown>;
      servers?: Record<string, unknown>[];
      components?: Record<string, unknown>;
      security?: Record<string, unknown>[];
      [key: string]: unknown;
    };
    apis: string[];
  }
  function swaggerJsdoc(options: SwaggerJsdocOptions): Record<string, unknown>;
  export default swaggerJsdoc;
}

declare module "swagger-ui-express" {
  import { RequestHandler } from "express";
  interface SwaggerUiOptions {
    customCss?: string;
    customSiteTitle?: string;
  }
  export const serve: RequestHandler;
  export function setup(spec: Record<string, unknown>, options?: SwaggerUiOptions): RequestHandler;
}
