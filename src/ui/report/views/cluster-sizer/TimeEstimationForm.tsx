import { css } from "@emotion/css";
import {
  Flex,
  FlexItem,
  FormGroup,
  Slider,
  type SliderOnChangeEvent,
  Stack,
  StackItem,
  TextInput,
} from "@patternfly/react-core";
import React, { useCallback } from "react";

import { ESTIMATION_SLIDER_LIMITS } from "./constants";
import type { EstimationFormValues } from "./types";

interface TimeEstimationFormProps {
  values: EstimationFormValues;
  onChange: (values: EstimationFormValues) => void;
}

const sliderRowStyle = css`
  align-items: center;
  gap: var(--pf-t--global--spacer--300);
`;

const inputStyle = css`
  max-width: 80px;
`;

const inputWideStyle = css`
  max-width: 110px;
`;

const rangeLabelsStyle = css`
  display: flex;
  justify-content: space-between;
  color: var(--pf-t--global--text--color--subtle);
  font-size: var(--pf-t--global--font--size--sm);
  margin-top: calc(-1 * var(--pf-t--global--spacer--100));
`;

const sliderWrapperStyle = css`
  flex: 1;
`;

interface SliderFieldProps {
  label: string;
  fieldId: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  wideInput?: boolean;
  onChange: (value: number) => void;
}

const SliderField: React.FC<SliderFieldProps> = ({
  label,
  fieldId,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  wideInput = false,
  onChange,
}) => {
  const handleSliderChange = useCallback(
    (_event: SliderOnChangeEvent, sliderValue: number) => {
      onChange(sliderValue);
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, inputValue: string) => {
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        const clamped = Math.min(max, Math.max(min, parsed));
        const rounded = Math.round(clamped / step) * step;
        onChange(parseFloat(rounded.toFixed(10)));
      }
    },
    [onChange, min, max, step],
  );

  return (
    <FormGroup label={label} fieldId={fieldId}>
      <Flex className={sliderRowStyle}>
        <FlexItem>
          <TextInput
            id={fieldId}
            type="number"
            value={value}
            onChange={handleInputChange}
            aria-label={label}
            className={wideInput ? inputWideStyle : inputStyle}
          />
        </FlexItem>
        <FlexItem grow={{ default: "grow" }}>
          <div className={sliderWrapperStyle}>
            <Slider
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={handleSliderChange}
              aria-label={label}
              showBoundaries={false}
              showTicks={false}
            />
            <div className={rangeLabelsStyle}>
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>
          </div>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export const TimeEstimationForm: React.FC<TimeEstimationFormProps> = ({
  values,
  onChange,
}) => {
  const limits = ESTIMATION_SLIDER_LIMITS;

  const handleFieldChange = useCallback(
    (field: keyof EstimationFormValues) => (raw: number) => {
      onChange({ ...values, [field]: raw });
    },
    [values, onChange],
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <SliderField
          label="Network transfer rate"
          fieldId="estimation-transfer-rate"
          value={values.transferRateMbps}
          min={limits.transferRateMbps.min}
          max={limits.transferRateMbps.max}
          step={limits.transferRateMbps.step}
          minLabel="0 Mbps"
          maxLabel="10,000 Mbps"
          wideInput
          onChange={handleFieldChange("transferRateMbps")}
        />
      </StackItem>

      <StackItem>
        <SliderField
          label="Work hours per day"
          fieldId="estimation-work-hours"
          value={values.workHoursPerDay}
          min={limits.workHoursPerDay.min}
          max={limits.workHoursPerDay.max}
          step={limits.workHoursPerDay.step}
          minLabel="0 hours"
          maxLabel="24 hours"
          onChange={handleFieldChange("workHoursPerDay")}
        />
      </StackItem>

      <StackItem>
        <SliderField
          label="Troubleshooting time per VM"
          fieldId="estimation-troubleshoot"
          value={values.troubleshootMinsPerVm}
          min={limits.troubleshootMinsPerVm.min}
          max={limits.troubleshootMinsPerVm.max}
          step={limits.troubleshootMinsPerVm.step}
          minLabel="0 minutes"
          maxLabel="180 minutes"
          onChange={handleFieldChange("troubleshootMinsPerVm")}
        />
      </StackItem>

      <StackItem>
        <SliderField
          label="Post-migration engineers"
          fieldId="estimation-engineers"
          value={values.postMigrationEngineers}
          min={limits.postMigrationEngineers.min}
          max={limits.postMigrationEngineers.max}
          step={limits.postMigrationEngineers.step}
          minLabel="0 engineers"
          maxLabel="50 engineers"
          onChange={handleFieldChange("postMigrationEngineers")}
        />
      </StackItem>
    </Stack>
  );
};

TimeEstimationForm.displayName = "TimeEstimationForm";

export default TimeEstimationForm;
