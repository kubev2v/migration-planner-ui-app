import * as yup from "yup";

import type { StandaloneCostEstimationFormValues } from "../../../../models/StandaloneCostEstimationModel";

export const standaloneCostEstimationValidationSchema: yup.ObjectSchema<StandaloneCostEstimationFormValues> =
  yup.object().shape({
    // Customer
    customerName: yup
      .string()
      .required("Customer name is required")
      .default(""),

    // Customer environment
    hosts: yup
      .number()
      .typeError("Total ESXi hosts is required")
      .required("Total ESXi hosts is required")
      .min(1, "Must be at least 1")
      .default(800),

    socketsPerHost: yup
      .number()
      .typeError("Sockets per host is required")
      .required("Sockets per host is required")
      .min(1, "Must be at least 1")
      .default(2),

    coresPerSocket: yup
      .number()
      .typeError("Cores per socket is required")
      .required("Cores per socket is required")
      .min(16, "Must be at least 16")
      .default(64),

    vms: yup
      .number()
      .typeError("Total VMs is required")
      .required("Total VMs is required")
      .min(0, "Cannot be negative")
      .default(20000),

    consolidationPct: yup
      .number()
      .typeError("Consolidation percentage is required")
      .required("Consolidation percentage is required")
      .min(0, "Cannot be negative")
      .max(100, "Cannot exceed 100%")
      .default(10),

    // Red Hat scope
    rhEdition: yup
      .string()
      .oneOf(["OVE", "OKE", "OCP", "OPP"] as const, "Invalid OpenShift edition")
      .required("OpenShift edition is required")
      .default("OVE"),

    includeACM: yup.boolean().required().default(true),
    withAap: yup.boolean().required().default(false),
    includeSwingHardware: yup.boolean().required().default(true),
    includeAdditionalStorage: yup.boolean().required().default(false),
    includeISV: yup.boolean().required().default(false),

    // VMware plans to compare
    showVcf: yup.boolean().required().default(true),
    showVvf: yup.boolean().required().default(true),
    showVvs: yup.boolean().required().default(false),

    // Unit pricing — VMware
    priceVcf: yup
      .number()
      .typeError("VCF price is required")
      .required("VCF price is required")
      .min(0, "Cannot be negative")
      .default(400),

    priceVvf: yup
      .number()
      .typeError("VVF price is required")
      .required("VVF price is required")
      .min(0, "Cannot be negative")
      .default(190),

    priceVvs: yup
      .number()
      .typeError("VVS price is required")
      .required("VVS price is required")
      .min(0, "Cannot be negative")
      .default(50),

    // Unit pricing — Red Hat
    priceOve: yup
      .number()
      .typeError("OVE price is required")
      .required("OVE price is required")
      .min(0, "Cannot be negative")
      .default(3000),

    priceOke: yup
      .number()
      .typeError("OKE price is required")
      .required("OKE price is required")
      .min(0, "Cannot be negative")
      .default(13200),

    priceOcp: yup
      .number()
      .typeError("OCP price is required")
      .required("OCP price is required")
      .min(0, "Cannot be negative")
      .default(26400),

    priceOpp: yup
      .number()
      .typeError("OPP price is required")
      .required("OPP price is required")
      .min(0, "Cannot be negative")
      .default(49500),

    priceAcmVirt: yup
      .number()
      .typeError("ACM Virtualization price is required")
      .required("ACM Virtualization price is required")
      .min(0, "Cannot be negative")
      .default(2200),

    priceAcmK8s: yup
      .number()
      .typeError("ACM Kubernetes price is required")
      .required("ACM Kubernetes price is required")
      .min(0, "Cannot be negative")
      .default(9900),

    serverCost: yup
      .number()
      .typeError("Server cost is required")
      .required("Server cost is required")
      .min(0, "Cannot be negative")
      .default(18000),

    // Discounts & overrides
    discountVcf: yup
      .number()
      .typeError("VCF discount is required")
      .required("VCF discount is required")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

    discountVvf: yup
      .number()
      .typeError("VVF discount is required")
      .required("VVF discount is required")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

    discountVvs: yup
      .number()
      .typeError("VVS discount is required")
      .required("VVS discount is required")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

    discountRh: yup
      .number()
      .typeError("Red Hat discount is required")
      .required("Red Hat discount is required")
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

    overrideMigrationCost: yup.boolean().required().default(false),

    migrationCostOverride: yup
      .number()
      .typeError("Migration cost is required")
      .required("Migration cost is required")
      .min(0, "Cannot be negative")
      .default(0),
  });
