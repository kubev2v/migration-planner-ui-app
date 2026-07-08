import { css } from "@emotion/css";
import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from "@patternfly/react-core";
import { RhUiFilterIcon } from "@patternfly/react-icons";
import React, { useState } from "react";

import type {
  AttributeValueFilterAttribute,
  CheckboxFilterAttribute,
  TextFilterAttribute,
} from "./types";

const searchInputStyle = css`
  min-width: 300px;
  width: 300px;
`;

const valueToggleStyle = css`
  min-width: 300px;
`;

export type AttributeValueFilterProps = {
  attributes: AttributeValueFilterAttribute[];
  defaultActiveAttributeId?: string;
  searchInputClassName?: string;
};

const getOptionLabel = (
  attribute: CheckboxFilterAttribute,
  value: string,
): string =>
  attribute.options.find((option) => option.value === value)?.label ?? value;

const toSelectValue = (
  value: string | number | undefined,
): string | undefined => {
  if (typeof value === "undefined") {
    return undefined;
  }
  return typeof value === "string" ? value : String(value);
};

const TextValueFilter: React.FC<{
  attribute: TextFilterAttribute;
  isActive: boolean;
  className?: string;
}> = ({ attribute, isActive, className }) => (
  <ToolbarFilter
    labels={attribute.value !== "" ? [attribute.value] : []}
    deleteLabel={() => attribute.onChange("")}
    deleteLabelGroup={() => attribute.onChange("")}
    categoryName={attribute.label}
    showToolbarItem={isActive}
  >
    <SearchInput
      id={`attribute-value-filter-${attribute.id}`}
      aria-label={
        attribute.ariaLabel ?? `Filter by ${attribute.label.toLowerCase()}`
      }
      placeholder={
        attribute.placeholder ?? `Filter by ${attribute.label.toLowerCase()}`
      }
      value={attribute.value}
      onChange={(_event, value) => attribute.onChange(value)}
      onClear={() => attribute.onChange("")}
      className={className ?? searchInputStyle}
    />
  </ToolbarFilter>
);

const CheckboxValueFilter: React.FC<{
  attribute: CheckboxFilterAttribute;
  isActive: boolean;
}> = ({ attribute, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (value: string): void => {
    const nextSelections = attribute.selections.includes(value)
      ? attribute.selections.filter((selection) => selection !== value)
      : [value, ...attribute.selections];
    attribute.onSelectionsChange(nextSelections);
  };

  const removeSelection = (label: string): void => {
    const option = attribute.options.find(
      (candidate) => candidate.label === label,
    );
    if (!option) {
      return;
    }
    attribute.onSelectionsChange(
      attribute.selections.filter((selection) => selection !== option.value),
    );
  };

  const labels = attribute.selections.map((value) =>
    getOptionLabel(attribute, value),
  );

  return (
    <ToolbarFilter
      labels={labels}
      deleteLabel={(_category, label) => removeSelection(label as string)}
      deleteLabelGroup={() => attribute.onSelectionsChange([])}
      categoryName={attribute.label}
      showToolbarItem={isActive}
    >
      <Select
        isOpen={isOpen}
        selected={attribute.selections}
        onSelect={(_event, value: string | number | undefined) => {
          const selectedValue = toSelectValue(value);
          if (!selectedValue) {
            return;
          }
          toggleSelection(selectedValue);
        }}
        onOpenChange={setIsOpen}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen((open) => !open)}
            isExpanded={isOpen}
            className={valueToggleStyle}
            {...(attribute.selections.length > 0 && {
              badge: <Badge isRead>{attribute.selections.length}</Badge>,
            })}
          >
            {`Filter by ${attribute.label.toLowerCase()}`}
          </MenuToggle>
        )}
      >
        <SelectList>
          {attribute.options.map((option) => (
            <SelectOption
              key={option.value}
              value={option.value}
              hasCheckbox
              isSelected={attribute.selections.includes(option.value)}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </ToolbarFilter>
  );
};

export const AttributeValueFilter: React.FC<AttributeValueFilterProps> = ({
  attributes,
  defaultActiveAttributeId,
  searchInputClassName,
}) => {
  const [activeAttributeId, setActiveAttributeId] = useState(
    defaultActiveAttributeId ?? attributes[0]?.id ?? "",
  );
  const [isAttributeSelectOpen, setIsAttributeSelectOpen] = useState(false);

  const resolvedActiveAttributeId = attributes.some(
    (attribute) => attribute.id === activeAttributeId,
  )
    ? activeAttributeId
    : (attributes[0]?.id ?? "");

  const activeAttribute =
    attributes.find(
      (attribute) => attribute.id === resolvedActiveAttributeId,
    ) ?? attributes[0];

  return (
    <ToolbarToggleGroup toggleIcon={<RhUiFilterIcon />} breakpoint="xl">
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>
          <Select
            isOpen={isAttributeSelectOpen}
            selected={resolvedActiveAttributeId}
            onSelect={(_event, value: string | number | undefined) => {
              const selectedValue = toSelectValue(value);
              if (!selectedValue) {
                return;
              }
              setActiveAttributeId(selectedValue);
              setIsAttributeSelectOpen(false);
            }}
            onOpenChange={setIsAttributeSelectOpen}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsAttributeSelectOpen((open) => !open)}
                isExpanded={isAttributeSelectOpen}
                icon={<RhUiFilterIcon />}
              >
                {activeAttribute?.label ?? "Filter"}
              </MenuToggle>
            )}
          >
            <SelectList>
              {attributes.map((attribute) => (
                <SelectOption key={attribute.id} value={attribute.id}>
                  {attribute.label}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </ToolbarItem>
        {attributes.map((attribute) =>
          attribute.type === "text" ? (
            <TextValueFilter
              key={attribute.id}
              attribute={attribute}
              isActive={resolvedActiveAttributeId === attribute.id}
              className={searchInputClassName}
            />
          ) : (
            <CheckboxValueFilter
              key={attribute.id}
              attribute={attribute}
              isActive={resolvedActiveAttributeId === attribute.id}
            />
          ),
        )}
      </ToolbarGroup>
    </ToolbarToggleGroup>
  );
};

AttributeValueFilter.displayName = "AttributeValueFilter";
