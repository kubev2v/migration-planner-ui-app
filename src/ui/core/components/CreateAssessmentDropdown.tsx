import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../routing/Routes";

type Props = {
  toggleLabel?: string;
  onSelectRvtools: () => void;
};

const CreateAssessmentDropdown: React.FC<Props> = ({
  toggleLabel = "Create",
  onSelectRvtools,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          variant="primary"
          onClick={() => setIsOpen((prev) => !prev)}
          isExpanded={isOpen}
        >
          {toggleLabel}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem
          key="agent"
          component="button"
          onClick={() =>
            navigate(routes.assessmentCreate, {
              state: { reset: true },
            })
          }
        >
          With discovery OVA
        </DropdownItem>
        <DropdownItem
          key="rvtools"
          component="button"
          onClick={() => {
            setIsOpen(false);
            onSelectRvtools();
          }}
        >
          From RVTools (XLS/X)
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

CreateAssessmentDropdown.displayName = "CreateAssessmentDropdown";

export default CreateAssessmentDropdown;
