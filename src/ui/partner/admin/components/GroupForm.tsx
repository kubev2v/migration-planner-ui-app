import { css } from "@emotion/css";
import { yupResolver } from "@hookform/resolvers/yup";
import type {
  Group,
  GroupCreate,
  GroupCreateKindEnum,
} from "@openshift-migration-advisor/planner-sdk";
import {
  SelectFormGroup,
  TextAreaFormGroup,
  TextInputFormGroup,
} from "@openshift-migration-advisor/shared-components";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { RhUiUploadIcon } from "@patternfly/react-icons";
import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";

import type { Partner } from "../../../../models/PartnerModel";
import { PartnersGallery } from "../../regularUser/components/PartnersGallery";

export type CreateGroupFormValues = GroupCreate;

export type EditGroupFormValues = Pick<
  Group,
  "id" | "name" | "description" | "icon" | "company"
>;

const validationSchema: yup.ObjectSchema<CreateGroupFormValues> = yup
  .object()
  .shape({
    name: yup.string().trim().required("Name is required"),
    description: yup.string().trim().default(""),
    icon: yup.string().default(""),
    kind: yup
      .string()
      .oneOf(["admin", "partner"] as const)
      .required("Kind is required") as yup.Schema<GroupCreateKindEnum>,
    company: yup.string().trim().required("Company is required"),
  });

interface BaseGroupFormProps {
  id: string;
  setIsValid?: (isValid: boolean) => void;
}

interface EditGroupFormProps extends BaseGroupFormProps {
  group: Group;
  onSubmit: (values: EditGroupFormValues) => void;
}

interface CreateGroupFormProps extends BaseGroupFormProps {
  group?: never;
  onSubmit: (values: CreateGroupFormValues) => void;
}

export type GroupFormProps = EditGroupFormProps | CreateGroupFormProps;

const previewContainerStyle = css`
  max-width: 340px;
`;

export const GroupForm: React.FC<GroupFormProps> = ({
  id,
  group,
  onSubmit,
  setIsValid,
}) => {
  const methods = useForm<CreateGroupFormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onTouched",
    defaultValues: group
      ? {
          name: group.name,
          description: group.description || "",
          icon: group.icon || "",
          kind: group.kind,
          company: group.company || "",
        }
      : {
          name: "",
          description: "",
          icon: "",
          kind: "partner" as GroupCreateKindEnum,
          company: "",
        },
  });

  const [imageError, setImageError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = useWatch({ control: methods.control, name: "name" });
  const description = useWatch({
    control: methods.control,
    name: "description",
  });
  const icon = useWatch({ control: methods.control, name: "icon" });
  const company = useWatch({ control: methods.control, name: "company" });
  const kind = useWatch({ control: methods.control, name: "kind" });

  const previewPartner: Partner = {
    id: group?.id || "preview",
    name: name || "",
    description: description || "",
    icon: icon || "",
    company: company || "",
    kind: "partner",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  useEffect(() => {
    setIsValid?.(methods.formState.isValid);
  }, [methods.formState.isValid, setIsValid]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () =>
        reject(
          reader.error instanceof Error
            ? reader.error
            : new Error("Failed to read file"),
        );
      reader.readAsDataURL(file);
    });
  };

  const handleLoadImageClick = () => {
    setImageError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError("");
    event.target.value = "";

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setImageError(
        "Unsupported file format. Please select PNG, JPEG, GIF, or SVG.",
      );
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setImageError(
        "File size exceeds 2MB limit. Please select a smaller image.",
      );
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      methods.setValue("icon", base64, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      setImageError("Failed to read file. Please try another image.");
    }
  };

  const handleFormSubmit = (data: CreateGroupFormValues) => {
    if (group) {
      onSubmit({
        id: group.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        company: data.company,
      });
    } else {
      onSubmit(data);
    }
  };

  return (
    <FormProvider {...methods}>
      <Grid hasGutter>
        <GridItem span={6}>
          <Card>
            <CardBody>
              <Form
                noValidate
                id={id}
                onSubmit={(e) => {
                  void methods.handleSubmit(handleFormSubmit)(e);
                }}
              >
                <TextInputFormGroup
                  label="Group Name"
                  id="group-name"
                  name="name"
                  isRequired
                  placeholder="Example: Tech Solutions Inc"
                />

                <TextInputFormGroup
                  label="Company"
                  id="group-company"
                  name="company"
                  isRequired
                  placeholder="Example: Acme Corporation"
                />

                <SelectFormGroup
                  label="Kind"
                  id="group-kind"
                  name="kind"
                  isRequired
                  isDisabled={!!group}
                  options={[
                    { label: "Partner", value: "partner" },
                    { label: "Admin", value: "admin" },
                  ]}
                />

                <TextAreaFormGroup
                  label="Description"
                  id="group-description"
                  name="description"
                  placeholder="Example: Leading technology solutions provider"
                />

                <FormGroup label="Icon" fieldId="group-icon">
                  <Flex gap={{ default: "gapSm" }}>
                    <FlexItem flex={{ default: "flex_1" }}>
                      <TextInputFormGroup
                        label=""
                        id="group-icon"
                        name="icon"
                        placeholder="data:image/svg+xml;base64,..."
                        helpText="Base64 encoded image or URL to group icon"
                      />
                    </FlexItem>
                    <FlexItem>
                      <Button
                        variant="control"
                        onClick={handleLoadImageClick}
                        icon={<RhUiUploadIcon />}
                      >
                        Load Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/svg+xml"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          void handleFileChange(e);
                        }}
                      />
                    </FlexItem>
                  </Flex>
                  {imageError && (
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem variant="error">
                          {imageError}
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  )}
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h2">Preview partner card</Title>
            </StackItem>
            <StackItem>
              <Content component="p">
                This preview shows how your partner group will be displayed to
                users when they browse available partners
              </Content>
            </StackItem>
            <StackItem>
              {kind === "admin" ? (
                <Alert
                  variant="info"
                  title="Admin groups are not displayed in the partner gallery"
                  isInline
                >
                  Only partner groups are shown to users when browsing for
                  partners.
                </Alert>
              ) : (
                <div className={previewContainerStyle}>
                  <PartnersGallery
                    partners={[previewPartner]}
                    onRequestAssignment={() => {}}
                  />
                </div>
              )}
            </StackItem>
          </Stack>
        </GridItem>
      </Grid>
    </FormProvider>
  );
};

GroupForm.displayName = "GroupForm";
