import { Button, Content, ContentVariants } from "@patternfly/react-core";
import { RhUiQuestionMarkCircleIcon } from "@patternfly/react-icons";
import React, { useState } from "react";

import HowToCreateAnAssessmentModal from "./HowToCreateAnAssessmentModal";

export const HomeScreenSubtitle: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Content component={ContentVariants.p}>
        Use Migration Advisor to help you evaluate your VMware environment and
        plan a move to OpenShift Virtualization.{" "}
        <Button
          variant="link"
          isInline
          icon={<RhUiQuestionMarkCircleIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          How to create an assessment
        </Button>
      </Content>
      <HowToCreateAnAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

HomeScreenSubtitle.displayName = "HomeScreenSubtitle";

export default HomeScreenSubtitle;
