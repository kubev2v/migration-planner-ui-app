import { routes } from "../../../routing/Routes";
import { MANUAL_ENVIRONMENT_DETAILS_TAB } from "../views/migration-recommendations/types";

export const manualEnvironmentReportPath = (assessmentId: string): string =>
  `${routes.assessmentReport(assessmentId)}?tab=${MANUAL_ENVIRONMENT_DETAILS_TAB}`;
