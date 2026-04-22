import type {
  Group,
  Member,
  MemberCreate,
} from "@openshift-migration-advisor/planner-sdk";
import {
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { EllipsisVIcon, SearchIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import React, { useState } from "react";

import { sortByNewestFirst } from "../../../../lib/common/Sort";
import { ConfirmationModal } from "../../../core/components/ConfirmationModal";
import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { CreateGroupMemberModal } from "../components/CreateGroupMemberModal";
import { useGroupMembersViewModel } from "../view-models/useGroupMembersViewModel";

interface GroupMembersSectionProps {
  group: Group;
}

export const GroupMembersSection: React.FC<GroupMembersSectionProps> = ({
  group,
}) => {
  const vm = useGroupMembersViewModel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddMember = async (values: MemberCreate) => {
    await vm.addMember(group.id, values);
    setIsModalOpen(false);
  };

  const handleDeleteMember = async (member: Member) => {
    await vm.deleteMember(group.id, member.username);
    setDeleteTarget(null);
  };

  return (
    <PageSection>
      <Content>
        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
          <FlexItem>
            <Title headingLevel="h1">Group members</Title>
          </FlexItem>
          <FlexItem>
            <Button onClick={() => setIsModalOpen(true)}>
              Add group members
            </Button>
          </FlexItem>
        </Flex>
      </Content>
      {vm.isLoading && <LoadingSpinner />}
      {vm.error && (
        <div>
          Error loading members (id: {vm.id}): {vm.error.message}
        </div>
      )}
      {vm.members && vm.members.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText={`No members in this group`}
          variant="sm"
        />
      )}
      {vm.members && vm.members.length > 0 && (
        <Table aria-label="Members table" variant="compact">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th screenReaderText="Actions" />
            </Tr>
          </Thead>
          <Tbody>
            {sortByNewestFirst(vm.members).map((member) => (
              <Tr key={member.username}>
                <Td dataLabel="Username">{member.username}</Td>
                <Td dataLabel="Email">{member.email}</Td>
                <Td dataLabel="Actions" isActionCell>
                  <Dropdown
                    isOpen={openRowId === member.username}
                    popperProps={{
                      appendTo: () => document.body,
                      position: "end",
                    }}
                    onOpenChange={(isOpen) =>
                      setOpenRowId(isOpen ? member.username : null)
                    }
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        aria-label={`Actions for ${member.username}`}
                        variant="plain"
                        onClick={() =>
                          setOpenRowId((prev) =>
                            prev === member.username ? null : member.username,
                          )
                        }
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem
                        onClick={() => {
                          setDeleteTarget(member);
                          setOpenRowId(null);
                        }}
                      >
                        Delete member
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <CreateGroupMemberModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={(values) => {
          void handleAddMember(values);
        }}
      />

      {deleteTarget && (
        <ConfirmationModal
          title="Delete Member"
          titleIconVariant="warning"
          isOpen={Boolean(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              void handleDeleteMember(deleteTarget);
            }
          }}
          onClose={() => setDeleteTarget(null)}
        >
          Are you sure you want to delete member <b>{deleteTarget.username}</b>?
        </ConfirmationModal>
      )}
    </PageSection>
  );
};

GroupMembersSection.displayName = "GroupMembersSection";
