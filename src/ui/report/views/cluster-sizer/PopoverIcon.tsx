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
  themePopoverFlyoutClassName,
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
  appendTo = getFlyoutAppendTo,
  ...props
}) => (
  // Popover prop order matters:
  // 1. {...props} first — forwards all PopoverProps except those overridden below.
  // 2. appendTo / className after the spread — prevents consumers from silently
  //    dropping theme flyout styles by passing their own className via props.
  // Do NOT destructure className out of props; it must stay on props so we can
  // compose it here. classNames merge order: theme base, then consumer extension.
  <Popover
    {...props}
    appendTo={appendTo}
    className={classNames(themePopoverFlyoutClassName, props.className)}
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
