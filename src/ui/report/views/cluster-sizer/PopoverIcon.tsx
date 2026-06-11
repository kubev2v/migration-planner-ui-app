import {
  Button,
  type ButtonProps,
  Icon,
  Popover,
} from "@patternfly/react-core";
import type { PopoverProps } from "@patternfly/react-core/dist/js/components/Popover/Popover";
import { RhUiQuestionMarkCircleIcon } from "@patternfly/react-icons";
import type { SVGIconProps } from "@patternfly/react-icons/dist/js/createIcon";
import classNames from "classnames";
import React from "react";

import {
  getFlyoutAppendTo,
  themeAwarePopoverClassName,
} from "../../../../lib/patternfly/flyoutAppendTo";

type PopoverIconProps = PopoverProps & {
  variant?: ButtonProps["variant"];
  component?: ButtonProps["component"];
  IconComponent?: React.ComponentClass<SVGIconProps>;
  noVerticalAlign?: boolean;
  buttonClassName?: string;
  buttonOuiaId?: string;
  buttonStyle?: React.CSSProperties;
};

const PopoverIcon: React.FC<PopoverIconProps> = ({
  component,
  variant = "plain",
  IconComponent = RhUiQuestionMarkCircleIcon,
  noVerticalAlign = false,
  buttonClassName,
  buttonOuiaId,
  buttonStyle,
  className,
  appendTo = getFlyoutAppendTo,
  ...props
}) => (
  <Popover
    appendTo={appendTo}
    className={classNames(themeAwarePopoverClassName, className)}
    {...props}
  >
    <Button
      icon={
        <Icon isInline={noVerticalAlign}>
          <IconComponent />
        </Icon>
      }
      component={component}
      variant={variant}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={classNames(
        "pf-v6-c-form__group-label-help",
        "pf-v6-u-p-0",
        buttonClassName,
      )}
      ouiaId={buttonOuiaId}
      style={buttonStyle}
    />
  </Popover>
);

export default PopoverIcon;
