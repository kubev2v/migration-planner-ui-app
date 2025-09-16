import React, { useState } from 'react';

import { Tab, TabContent, TabTitleText,Tabs } from '@patternfly/react-core';

import { AppPage } from '../components/AppPage';

import { Environment } from './environment/Environment';
import { MigrationAssessmentPageContent } from './MigrationAssessmentPage';

const MigrationPage: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ): void => {
    setActiveTabKey(tabIndex);
  };

  return (
    <AppPage
      breadcrumbs={[
        {
          key: 1,
          to: '#',
          children: 'Migration assessment',
          isActive: true,
        },
      ]}
      title="Welcome, let's start your migration journey from VMware to OpenShift."
    >
      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label="Migration tabs"
        role="region"
      >
        <Tab
          eventKey={0}
          title={<TabTitleText>Assessments</TabTitleText>}
          aria-label="Assessments tab"
        >
          <TabContent
            eventKey={0}
            id="assessments-tab-content"
            style={{ padding: 0, marginTop: '24px' }}
          >
            <MigrationAssessmentPageContent />
          </TabContent>
        </Tab>

        <Tab
          eventKey={1}
          title={<TabTitleText>Environments</TabTitleText>}
          aria-label="Environments tab"
        >
          <TabContent
            eventKey={1}
            id="environments-tab-content"
            style={{ padding: 0, marginTop: '24px' }}
          >
            <Environment />
          </TabContent>
        </Tab>
      </Tabs>
    </AppPage>
  );
};

MigrationPage.displayName = 'MigrationPage';

export default MigrationPage;
