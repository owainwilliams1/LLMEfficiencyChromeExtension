/**
 * types.ts
 * Owain Williams
 */

export type CLASSIFICATION = "role" | "tone" | "detail";

export const CLASSIFICATION_COLORS: Record<CLASSIFICATION, { primary: string, background: string }> = {
  role: {
    primary: "#C026D3",
    background: "#F5DDF9"
  },
  tone: {
    primary: "#FFA400",
    background: "#FFF1D6"
  },
  detail: {
    primary: "#56CBF9",
    background: "#D8F3FD"
  }
};

export interface Correction {
  classification: CLASSIFICATION;
  target: string;
  correction: string;
  description: string;
}
