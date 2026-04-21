import { css } from "@emotion/css";
import type { Group } from "@openshift-migration-advisor/planner-sdk";
import {
  Alert,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "../../../../routing/Routes";
import { ConfirmationModal } from "../../../core/components/ConfirmationModal";
import { LoadingSpinner } from "../../../core/components/LoadingSpinner";
import { CreateGroupModal } from "../components/CreateGroupModal";
import type { CreateGroupFormValues } from "../components/GroupForm";
import { GroupsTable } from "../components/GroupsTable";
import { useGroupsViewModel } from "../view-models/useGroupsViewModel";

const introStyle = css`
  padding-bottom: 1em;
`;

export const GroupsScreen: React.FC = () => {
  const vm = useGroupsViewModel();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  const handleCreateGroup = async (values: CreateGroupFormValues) => {
    await vm.createGroup(values);
    setIsCreateModalOpen(false);
  };

  const handleDelete = async (group: Group) => {
    await vm.deleteGroup(group.id);
    setDeleteTarget(null);
  };

  return (
    <PageSection>
      {vm.isLoading && <LoadingSpinner />}

      {vm.error && (
        <div className={introStyle}>
          <Alert isInline variant="danger" title="Group API error">
            {vm.error.message}
          </Alert>
        </div>
      )}

      {!vm.isLoading && vm.groups.length === 0 && (
        <EmptyState
          headingLevel="h4"
          icon={SearchIcon}
          titleText="No groups available"
          variant="sm"
        >
          <EmptyStateBody>
            Begin by creating a partner or admin group.
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create group
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      )}

      {!vm.isLoading && vm.groups.length > 0 && (
        <GroupsTable
          groups={vm.groups}
          onCreateGroupClick={() => setIsCreateModalOpen(true)}
          onGroupClick={(groupId) => navigate(routes.adminGroupById(groupId))}
          onDeleteGroup={setDeleteTarget}
        />
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(values) => {
          void handleCreateGroup(values);
        }}
      />

      {deleteTarget && (
        <ConfirmationModal
          title="Delete Group"
          titleIconVariant="warning"
          isOpen={Boolean(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              void handleDelete(deleteTarget);
            }
          }}
          onClose={() => setDeleteTarget(null)}
        >
          Are you sure you want to delete <b>{deleteTarget.name}</b>?
        </ConfirmationModal>
      )}
    </PageSection>
  );
};

GroupsScreen.displayName = "GroupsScreen";
