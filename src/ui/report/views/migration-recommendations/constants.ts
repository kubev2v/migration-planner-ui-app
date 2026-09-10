import type { RecommendationToolCard, RecommendationToolId } from "./types";

export const RECOMMENDATION_TOOL_CARDS: RecommendationToolCard[] = [
  {
    id: "architecture",
    title: "OpenShift cluster architecture",
    description:
      "Define architecture inputs and target cluster profile recommendations.",
    isDisabled: false,
  },
  {
    id: "time-estimation",
    title: "Migration time estimation",
    description:
      "Estimate migration duration based on workload and throughput assumptions.",
    isDisabled: false,
  },
  {
    id: "complexity",
    title: "Migration complexity",
    description:
      "View complexity signals to compare migration effort across clusters.",
    isDisabled: false,
  },
  {
    id: "plan",
    title: "Migration plan",
    description: "Plan content placeholder (coming soon).",
    isDisabled: true,
  },
];

const ENVIRONMENT_WIDE_TOOL_IDS: RecommendationToolId[] = [
  "time-estimation",
  "complexity",
];

const CLUSTER_TOOL_IDS: RecommendationToolId[] = [
  "architecture",
  "time-estimation",
  "complexity",
  "plan",
];

export const isRecommendationToolAvailable = (
  toolId: RecommendationToolId,
  isAggregateView: boolean,
): boolean => {
  const availableIds = isAggregateView
    ? ENVIRONMENT_WIDE_TOOL_IDS
    : CLUSTER_TOOL_IDS;
  return availableIds.includes(toolId) && toolId !== "plan";
};

export const getRecommendationToolCards = (
  isAggregateView: boolean,
): RecommendationToolCard[] => {
  const availableIds = isAggregateView
    ? ENVIRONMENT_WIDE_TOOL_IDS
    : CLUSTER_TOOL_IDS;
  return RECOMMENDATION_TOOL_CARDS.filter((card) =>
    availableIds.includes(card.id),
  );
};

export const getRecommendationToolTitle = (
  toolId: RecommendationToolId,
): string =>
  RECOMMENDATION_TOOL_CARDS.find((card) => card.id === toolId)?.title ?? "";
