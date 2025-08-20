import React, { useEffect } from 'react';
import {
  Button,
  useWizardContext,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
} from '@patternfly/react-core';
import { ConnectStep } from './steps/connect/ConnectStep';
import { DiscoveryStep } from './steps/discovery/DiscoveryStep';
import { useComputedHeightFromPageHeader } from './hooks/UseComputedHeightFromPageHeader';
import { useDiscoverySources } from './contexts/discovery-sources/Context';
import { PrepareMigrationStep } from './steps/prepare-migration/PrepareMigrationStep';
import { Source } from '@migration-planner-ui/api-client/models';

const openAssistedInstaller = (): void => {
  const currentHost = window.location.hostname;
  
  
  if (currentHost === 'console.stage.redhat.com') {
    console.log('Opening dev URL for stage environment');
    window.open(
      'https://console.dev.redhat.com/openshift/assisted-installer/clusters/~new?source=assisted_migration',
      '_blank',
    );
  } else {
    console.log('Opening default URL');
    window.open(
      '/openshift/assisted-installer/clusters/~new?source=assisted_migration',
      '_blank',
    );
  }
};

type CustomWizardFooterPropType = {
  isCancelHidden?: boolean;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  nextButtonText?: string;
  onNext?: () => void;
};

export const CustomWizardFooter: React.FC<CustomWizardFooterPropType> = ({
  isCancelHidden,
  isBackDisabled,
  isNextDisabled,
  nextButtonText,
  onNext,
}): JSX.Element => {
  const { goToNextStep, goToPrevStep, goToStepById } = useWizardContext();
  return (
    <>
      <WizardFooterWrapper>
        <Button
          ouiaId="wizard-back-btn"
          variant="secondary"
          onClick={goToPrevStep}
          isDisabled={isBackDisabled}
        >
          Back
        </Button>
        <Button
          ouiaId="wizard-next-btn"
          variant="primary"
          onClick={() => {
            if (onNext) {
              onNext();
            } else {
              goToNextStep();
            }
          }}
          isDisabled={isNextDisabled}
        >
          {nextButtonText ?? 'Next'}
        </Button>
        {!isCancelHidden && (
          <Button
            ouiaId="wizard-cancel-btn"
            variant="link"
            onClick={() => goToStepById('connect-step')}
          >
            Cancel
          </Button>
        )}
      </WizardFooterWrapper>
    </>
  );
};

export const MigrationWizard: React.FC = () => {
  const computedHeight = useComputedHeightFromPageHeader();
  const discoverSourcesContext = useDiscoverySources();
  const [firstSource, ..._otherSources] = discoverSourcesContext.sources ?? [];
  const [sourceSelected, setSourceSelected] = React.useState<Source>();
  const [isDiscoverySourceUpToDate, setIsDiscoverySourceUpToDate] =
    React.useState<boolean>(false);
  const [activeStepId, setActiveStepId] = React.useState<string>('connect-step');

  useEffect(() => {
    if (discoverSourcesContext.sourceSelected) {
      const foundSource: Source = discoverSourcesContext.sources.find(
        (source) => source.id === discoverSourcesContext.sourceSelected?.id,
      );
      if (foundSource) {
        setSourceSelected(foundSource);
        if (foundSource.onPremises) {
          setIsDiscoverySourceUpToDate(true);
        } else {
          setIsDiscoverySourceUpToDate(
            (foundSource.agent && foundSource.agent.status === 'up-to-date') ||
              foundSource.name === 'Example',
          );
        }
      } else {
        if (firstSource) {
          setSourceSelected(firstSource);
          if (firstSource.onPremises) {
            setIsDiscoverySourceUpToDate(firstSource.onPremises);
          } else {
            setIsDiscoverySourceUpToDate(
              (firstSource.agent &&
                firstSource.agent.status === 'up-to-date') ||
                firstSource.name === 'Example',
            );
          }
        } else {
          setSourceSelected(undefined);
          setIsDiscoverySourceUpToDate(false);
        }
      }
    }
  }, [
    discoverSourcesContext.sourceSelected,
    discoverSourcesContext.sources,
    firstSource,
  ]);

  return (
    <Wizard
      height={computedHeight}
      style={
        ['connect-step', 'plan-step'].includes(activeStepId)
          ? {
              display: 'flex',
              flexDirection: 'column',
              height: '65vh',
            }
          : undefined
      }
      onStepChange={(_event,step) => setActiveStepId(step.id as string)}
    >
      <WizardStep
        name="Connect"
        id="connect-step"
        footer={
          <CustomWizardFooter
            isCancelHidden={true}
            isNextDisabled={
              !isDiscoverySourceUpToDate || sourceSelected === null
            }
            isBackDisabled={true}
          />
        }
      >
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <ConnectStep />
        </div>
      </WizardStep>
      <WizardStep
        name="Discover"
        id="discover-step"
        footer={<CustomWizardFooter isCancelHidden={true} />}
        isDisabled={!isDiscoverySourceUpToDate || sourceSelected === null}
      >
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <DiscoveryStep />
        </div>
      </WizardStep>
      <WizardStep
        name="Plan"
        id="plan-step"
        footer={
          <CustomWizardFooter
            nextButtonText={"Let's create a new cluster"}
            onNext={openAssistedInstaller}
            isNextDisabled={sourceSelected?.name === 'Example'}
          />
        }
        isDisabled={!isDiscoverySourceUpToDate || sourceSelected === null}
      >
         <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <PrepareMigrationStep />
        </div>
      </WizardStep>
    </Wizard>
  );
};

MigrationWizard.displayName = 'MigrationWizard';
