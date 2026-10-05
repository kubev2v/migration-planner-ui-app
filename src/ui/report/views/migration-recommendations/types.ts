export const MANUAL_ENVIRONMENT_DETAILS_TAB = "manual-details" as const;

export type ReportContentTab =
  "report" | "recommendations" | typeof MANUAL_ENVIRONMENT_DETAILS_TAB;

export const reportTabFromSearch = (value: string | null): ReportContentTab => {
  if (value === "recommendations" || value === MANUAL_ENVIRONMENT_DETAILS_TAB) {
    return value;
  }
  return "report";
};

export type RecommendationToolId =
  "architecture" | "cost-estimation" | "time-estimation" | "complexity";

export interface RecommendationToolCard {
  id: RecommendationToolId;
  title: string;
  description: string;
  isDisabled: boolean;
}

export interface RecommendationToolCatalogOptions {
  isAggregateView: boolean;
  isPartner?: boolean;
}
