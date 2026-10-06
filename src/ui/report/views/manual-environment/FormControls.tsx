import { FormFieldHelperText } from "@openshift-migration-advisor/shared-components";
import {
  Button,
  FormGroup,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  type MenuToggleElement,
  Radio,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from "@patternfly/react-core";
import MinusIcon from "@patternfly/react-icons/dist/esm/icons/minus-icon";
import PlusIcon from "@patternfly/react-icons/dist/esm/icons/plus-icon";
import React, { useState } from "react";

import type { LabeledOption } from "../../manual-environment/types";
import {
  countControl,
  countInput,
  fullWidthField,
  placeholderText,
  radioRow,
} from "./styles";

interface CountFieldProps {
  id: string;
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  onBlur?: () => void;
  errorMessage?: string;
}

export const CountField: React.FC<CountFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  errorMessage,
}) => {
  const parsed = value === "" ? "" : String(value);
  const decrementDisabled = value === "" || value <= 0;

  const handleChange = (
    _event: React.FormEvent<HTMLInputElement>,
    raw: string,
  ): void => {
    if (raw === "") {
      onChange("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;
    onChange(Number(raw));
  };

  return (
    <FormGroup label={label} fieldId={id}>
      <InputGroup className={countControl}>
        <InputGroupItem>
          <Button
            variant="control"
            aria-label={`Decrease ${label}`}
            isDisabled={decrementDisabled}
            icon={<MinusIcon />}
            onClick={() => {
              if (value === "" || value <= 0) return;
              onChange(value - 1);
            }}
          />
        </InputGroupItem>
        <InputGroupItem>
          <TextInput
            id={id}
            className={countInput}
            type="text"
            inputMode="numeric"
            value={parsed}
            onChange={handleChange}
            onBlur={onBlur}
            validated={errorMessage ? "error" : "default"}
            aria-label={label}
            autoComplete="off"
            onWheel={(event) => {
              event.currentTarget.blur();
            }}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            aria-label={`Increase ${label}`}
            icon={<PlusIcon />}
            onClick={() => {
              onChange(value === "" ? 1 : value + 1);
            }}
          />
        </InputGroupItem>
      </InputGroup>
      <FormFieldHelperText errorMessage={errorMessage} />
    </FormGroup>
  );
};

CountField.displayName = "CountField";

interface YesNoFieldProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const YesNoField: React.FC<YesNoFieldProps> = ({
  id,
  label,
  value,
  onChange,
}) => (
  <FormGroup label={label} fieldId={id} role="radiogroup">
    <div className={radioRow}>
      <Radio
        id={`${id}-yes`}
        name={id}
        label="Yes"
        isChecked={value}
        onChange={() => {
          onChange(true);
        }}
      />
      <Radio
        id={`${id}-no`}
        name={id}
        label="No"
        isChecked={!value}
        onChange={() => {
          onChange(false);
        }}
      />
    </div>
  </FormGroup>
);

YesNoField.displayName = "YesNoField";

type OptionSelectProps<T extends string> =
  | {
      isMulti?: false;
      id: string;
      label: string;
      placeholder: string;
      options: readonly LabeledOption<T>[];
      value: T | "";
      onChange: (value: T | "") => void;
      onBlur?: () => void;
      errorMessage?: string;
    }
  | {
      isMulti: true;
      id: string;
      label: string;
      placeholder: string;
      options: readonly LabeledOption<T>[];
      value: readonly T[];
      onChange: (value: T[]) => void;
      onBlur?: () => void;
      errorMessage?: string;
    };

const labelsFor = <T extends string>(
  options: readonly LabeledOption<T>[],
  selected: readonly T[],
): string[] => {
  const selectedValues = new Set(selected);
  return options
    .filter((option) => selectedValues.has(option.value))
    .map((option) => option.label);
};

export function OptionSelect<T extends string>(
  props: OptionSelectProps<T>,
): React.ReactElement {
  const { id, label, placeholder, options, errorMessage } = props;
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabels = props.isMulti
    ? labelsFor(options, props.value)
    : props.value
      ? labelsFor(options, [props.value])
      : [];
  const hasSelection = selectedLabels.length > 0;
  const toggleText = hasSelection ? selectedLabels.join(", ") : placeholder;

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    selectedValue: string | number | undefined,
  ): void => {
    if (typeof selectedValue !== "string") return;
    const match = options.find((option) => option.value === selectedValue);
    if (!match) return;

    if (props.isMulti) {
      const current = props.value;
      const next = current.includes(match.value)
        ? current.filter((item) => item !== match.value)
        : [...current, match.value];
      props.onChange(next);
      return;
    }

    props.onChange(props.value === match.value ? "" : match.value);
    setIsOpen(false);
  };

  return (
    <FormGroup className={fullWidthField} label={label} fieldId={id}>
      <Select
        isOpen={isOpen}
        isScrollable
        maxMenuHeight="16rem"
        selected={props.isMulti ? [...props.value] : props.value || undefined}
        onSelect={handleSelect}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) props.onBlur?.();
        }}
        role={props.isMulti ? "menu" : undefined}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            id={id}
            ref={toggleRef}
            isFullWidth
            isInForm
            isExpanded={isOpen}
            onClick={() => {
              setIsOpen((open) => !open);
            }}
          >
            <span className={hasSelection ? undefined : placeholderText}>
              {toggleText}
            </span>
          </MenuToggle>
        )}
      >
        <SelectList>
          {options.map((option) => {
            const isSelected = props.isMulti
              ? props.value.includes(option.value)
              : props.value === option.value;
            return (
              <SelectOption
                key={option.value}
                value={option.value}
                hasCheckbox={props.isMulti}
                isSelected={isSelected}
              >
                {option.label}
              </SelectOption>
            );
          })}
        </SelectList>
      </Select>
      <FormFieldHelperText errorMessage={errorMessage} />
    </FormGroup>
  );
}

OptionSelect.displayName = "OptionSelect";
