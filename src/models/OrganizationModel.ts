export interface Organization {
  id: string;
  name: string;
  description: string;
  kind: "admin" | "partner";
  company: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}
