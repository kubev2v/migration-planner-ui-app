import * as yup from "yup";

import type { CostEstimationFormValues } from "../../../../../models/CostEstimationModel";

/**
 * Yup validation schema for the cost estimation form.
 * Validates all form fields according to business rules.
 */
export const costEstimationValidationSchema: yup.ObjectSchema<CostEstimationFormValues> =
  yup.object().shape({
    // Red Hat Solution Scope
    rhEdition: yup
      .string()
      .oneOf(["OVE", "OKE", "OCP", "OPP"] as const, "Invalid Red Hat edition")
      .required("Red Hat edition is required")
      .default("OVE"),

    includeACM: yup
      .boolean()
      .required("ACM inclusion is required")
      .default(true),

    // Consolidation
    consolidationPct: yup
      .number()
      .required("Consolidation percentage is required")
      .min(0, "Cannot be negative")
      .max(100, "Cannot exceed 100%")
      .default(10),
  });
