import React, { useState } from 'react';

import { Assessment as AssessmentModel } from '@migration-planner-ui/api-client/models';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  MenuToggleElement,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useDiscoverySources } from '../../migration-wizard/contexts/discovery-sources/Context';

import AssessmentsTable from './AssessmentsTable';
import CreateAssessmentModal, { AssessmentMode } from './CreateAssessmentModal';
import UpdateAssessment from './UpdateAssessment';

type Props = {
  assessments: AssessmentModel[];
  isLoading?: boolean;
  hasUpToDateSources?: boolean;
};

const Assessment: React.FC<Props> = ({ assessments, isLoading }) => {
  const discoverySourcesContext = useDiscoverySources();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    { index: number; direction: 'asc' | 'desc' } | undefined
  >({
    index: 0,
    direction: 'asc',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterBy, setFilterBy] = useState('Filter');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AssessmentMode>('inventory');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentModel | null>(null);

  const onSort = (
    _event: unknown,
    index: number,
    direction: 'asc' | 'desc',
  ): void => {
    setSortBy({ index, direction });
  };

  const onDropdownToggle = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onDropdownSelect = (): void => {
    setIsDropdownOpen(false);
  };

  const handleOpenModal = (mode: AssessmentMode): void => {
    setModalMode(mode);
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const handleUpdateAssessment = (assessmentId: string): void => {
    const assessment = assessments.find(
      (a) => (a as AssessmentModel).id === assessmentId,
    );
    if (assessment) {
      setSelectedAssessment(assessment);
      setIsUpdateModalOpen(true);
    }
  };

  const handleDeleteAssessment = (assessmentId: string): void => {
    const assessment = assessments.find(
      (a) => (a as AssessmentModel).id === assessmentId,
    );
    if (assessment) {
      setSelectedAssessment(assessment);
      setIsDeleteModalOpen(true);
    }
  };

  const handleCloseUpdateModal = (): void => {
    setIsUpdateModalOpen(false);
    setSelectedAssessment(null);
  };

  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setSelectedAssessment(null);
  };

  const handleConfirmUpdate = async (
    name: string,
    file?: File,
  ): Promise<void> => {
    if (!selectedAssessment) return;

    try {
      await discoverySourcesContext.updateAssessment(
        (selectedAssessment as AssessmentModel).id,
        name,
      );
      // Refresh assessments after successful update
      await discoverySourcesContext.listAssessments();
      handleCloseUpdateModal();
    } catch (error) {
      console.error('Failed to update assessment:', error);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedAssessment) return;

    try {
      await discoverySourcesContext.deleteAssessment(
        (selectedAssessment as AssessmentModel).id,
      );
      // Refresh assessments after successful deletion
      await discoverySourcesContext.listAssessments();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  };

  const handleSubmitAssessment = async (name: string, file: File | null) => {
    try {
      if (!file) throw new Error('File is required for RVTools assessment');

      // Create the assessment with RVTools file (only RVTools mode supported)
      await discoverySourcesContext.createAssessment(
        name,
        'rvtools',
        undefined, // jsonValue not used for rvtools mode
        undefined, // sourceId not used for rvtools mode
        file, // rvToolFile
      );

      // Refresh assessments list after successful creation
      await discoverySourcesContext.listAssessments();
    } catch (error) {
      console.error('Failed to create assessment:', error);
      throw error; // Re-throw so the modal can handle it
    }
  };

  return (
    <>
      <Toolbar inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarItem>
            <InputGroup>
              <InputGroupItem>
                <Dropdown
                  isOpen={isFilterDropdownOpen}
                  onSelect={() => setIsFilterDropdownOpen(false)}
                  onOpenChange={(isOpen: boolean) =>
                    setIsFilterDropdownOpen(isOpen)
                  }
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() =>
                        setIsFilterDropdownOpen(!isFilterDropdownOpen)
                      }
                      isExpanded={isFilterDropdownOpen}
                      style={{ minWidth: '180px', width: '180px' }}
                    >
                      <FilterIcon style={{ marginRight: '8px' }} />
                      {filterBy}
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem
                      key="sourceType"
                      onClick={() => setFilterBy('Source type')}
                    >
                      Source type
                    </DropdownItem>
                    <DropdownItem
                      key="owner"
                      onClick={() => setFilterBy('Owner')}
                    >
                      Owner
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </InputGroupItem>
              <InputGroupItem>
                <Button variant="control" aria-label="Search">
                  <SearchIcon />
                </Button>
              </InputGroupItem>
              <InputGroupItem isFill>
                <TextInput
                  name="assessment-search"
                  id="assessment-search"
                  type="search"
                  placeholder="Search"
                  style={{ minWidth: '300px', width: '300px' }}
                  value={search}
                  onChange={(_event, value) => setSearch(value)}
                />
              </InputGroupItem>
            </InputGroup>
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignLeft' }}>
            <Dropdown
              isOpen={isDropdownOpen}
              onSelect={onDropdownSelect}
              onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  variant="primary"
                  onClick={onDropdownToggle}
                  isExpanded={isDropdownOpen}
                >
                  Create new migration assessment
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <DropdownList>
                <DropdownItem
                  key="rvtools"
                  component="button"
                  onClick={() => handleOpenModal('rvtools')}
                >
                  From RVTools (XLS/X)
                </DropdownItem>
                <DropdownItem
                  key="agent"
                  component="button"
                  onClick={() => {
                    alert('To be implemented');
                  }}
                >
                  With discovery OVA
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <div style={{ marginTop: '24px' }}>
        <AssessmentsTable
          assessments={assessments}
          isLoading={isLoading}
          search={search}
          filterBy={filterBy}
          filterValue={search}
          sortBy={sortBy}
          onSort={onSort}
          onDelete={handleDeleteAssessment}
          onUpdate={handleUpdateAssessment}
        />
      </div>

      <CreateAssessmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAssessment}
        mode={modalMode}
        isLoading={discoverySourcesContext.isCreatingAssessment}
        selectedEnvironment={null}
      />

      <UpdateAssessment
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSubmit={handleConfirmUpdate}
        name={(selectedAssessment as AssessmentModel)?.name || ''}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Assessment"
        titleIconVariant="warning"
        primaryButtonVariant="danger"
      >
        `Are you sure you want to delete{' '}
        {(selectedAssessment as AssessmentModel)?.name}?`
      </ConfirmationModal>
    </>
  );
};

Assessment.displayName = 'Assessment';

export default Assessment;
