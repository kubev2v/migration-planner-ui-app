import {
  Dropdown,
  DropdownItem,
  DropdownList,
  type DropdownProps,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import React, { useState } from "react";

type CreateAssessmentDropdownProps = {
  toggleLabel?: string;
  onCreateRVToolAssessment: () => void;
  onCreateDiscoveryApplianceAssessment: () => void;
} & Omit<
  DropdownProps,
  | "isOpen"
  | "onOpenChange"
  | "toggle"
  | "shouldFocusToggleOnSelect"
  | "children"
>;

const CreateAssessmentDropdown: React.FC<CreateAssessmentDropdownProps> = ({
  toggleLabel = "Create assessment",
  onCreateRVToolAssessment,
  onCreateDiscoveryApplianceAssessment,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      {...props}
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
          key="rvtools"
          component="button"
          onClick={() => {
            setIsOpen(false);
            onCreateRVToolAssessment();
          }}
        >
          From an RVTools file
        </DropdownItem>
        <DropdownItem
          key="agent"
          component="button"
          onClick={() => {
            setIsOpen(false);
            onCreateDiscoveryApplianceAssessment();
          }}
        >
          From a discovery appliance
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

CreateAssessmentDropdown.displayName = "CreateAssessmentDropdown";

export default CreateAssessmentDropdown;
