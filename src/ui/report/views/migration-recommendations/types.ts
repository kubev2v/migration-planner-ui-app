export type ReportContentTab = "report" | "recommendations";

export type RecommendationToolId =
  "architecture" | "time-estimation" | "complexity" | "plan";

export interface RecommendationToolCard {
  id: RecommendationToolId;
  title: string;
  description: string;
  isDisabled: boolean;
}
