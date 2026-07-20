import * as yup from "yup";

import type { CostEstimationFormValues } from "../../../../../models/CostEstimationModel";

export const costEstimationValidationSchema: yup.ObjectSchema<CostEstimationFormValues> =
  yup.object().shape({
    // VMware Solution Scope
    vmwareSolution: yup
      .string()
      .oneOf(
        ["vmwareVcf", "vmwareVvf", "vmwareVvs"] as const,
        "Invalid VMware solution",
      )
      .required("VMware solution is required")
      .default("vmwareVcf"),

    vmwareDiscount: yup
      .number()
      .required("VMware discount is required")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

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

    openshiftDiscount: yup
      .number()
      .required("Red Hat discount is required")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

    withAap: yup.boolean().required().default(false),

    aapDiscount: yup
      .number()
      .required("AAP discount is required")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

    // Cost & infrastructure assumptions
    additionalStorageCost: yup
      .number()
      .required("Storage cost is required")
      .min(0, "Cannot be negative")
      .default(0),

    thirdPartyISVCost: yup
      .number()
      .required("ISV cost is required")
      .min(0, "Cannot be negative")
      .default(0),

    swingHardwareCost: yup
      .number()
      .required("Swing hardware cost is required")
      .min(0, "Cannot be negative")
      .default(0),

    consolidationPct: yup
      .number()
      .required("Consolidation percentage is required")
      .min(0, "Cannot be negative")
      .max(100, "Cannot exceed 100%")
      .default(10),
  });
