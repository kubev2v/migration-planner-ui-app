export type ReportContentTab = "report" | "recommendations";

export type RecommendationToolId =
  | "architecture"
  | "cost-estimation"
  | "time-estimation"
  | "complexity"
  | "plan";

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
