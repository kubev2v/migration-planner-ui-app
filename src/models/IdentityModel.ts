export interface Identity {
  username: string;
  kind: "partner" | "customer" | "regular" | "admin";
  organizationId: string;
  partnerId: string | null;
}

export type IdentityKind = Identity["kind"];
