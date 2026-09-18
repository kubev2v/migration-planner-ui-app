import { PageHeader } from "@patternfly/react-component-groups";
import {
  AlertGroup,
  Breadcrumb,
  BreadcrumbItem,
  type BreadcrumbItemProps,
  PageSection,
} from "@patternfly/react-core";
import React from "react";

type AppPageProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  caption?: React.ReactNode;
  breadcrumbs?: Array<BreadcrumbItemProps>;
  headerActions?: React.ReactNode;
  alerts?: React.ReactNode;
  children?: React.ReactNode;
};

export function AppPage({
  title,
  subtitle,
  caption,
  breadcrumbs,
  headerActions,
  alerts,
  children,
}: AppPageProps) {
  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actionMenu={headerActions}
        breadcrumbs={
          breadcrumbs && (
            <Breadcrumb>
              {breadcrumbs.map(({ key, children, ...bcProps }) => (
                <BreadcrumbItem key={key} {...bcProps}>
                  {children}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )
        }
      />
      <PageSection hasBodyWrapper={false}>
        {caption}
        {alerts && <AlertGroup>{alerts}</AlertGroup>}
        {children}
      </PageSection>
    </div>
  );
}
AppPage.displayName = "AppPage";
