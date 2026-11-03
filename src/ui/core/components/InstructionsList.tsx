import { List, ListItem, OrderType } from "@patternfly/react-core";
import React from "react";

export type InstructionItem = {
  text: React.ReactNode;
};

export type InstructionsListProps = {
  /** Array of instruction items to display in the numbered list */
  items: InstructionItem[];
  /** Number of the first item (defaults to 1) */
  start?: number;
};

export const InstructionsList: React.FC<InstructionsListProps> = ({
  items,
  start,
}) => {
  return (
    <List component="ol" type={OrderType.number} start={start}>
      {items.map((item, index) => (
        <ListItem key={index}>{item.text}</ListItem>
      ))}
    </List>
  );
};

InstructionsList.displayName = "InstructionsList";
