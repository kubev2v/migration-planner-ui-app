import type { Group } from "@openshift-migration-advisor/planner-sdk";
import {
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextArea,
  TextInput,
} from "@patternfly/react-core";
import React, { useState } from "react";

interface FormFieldValues {
  name: string;
  description: string;
  icon: string;
}

export interface EditGroupFormValues extends FormFieldValues {
  id: string;
}

interface EditGroupFormProps {
  id: string;
  group: Group;
  onSubmit: (values: EditGroupFormValues) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  icon?: string;
}

export const EditGroupForm: React.FC<EditGroupFormProps> = ({
  id,
  group,
  onSubmit,
}) => {
  const [values, setValues] = useState<FormFieldValues>({
    name: group.name,
    description: group.description || "",
    icon: group.icon,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (
    field: keyof FormErrors,
    value: string,
  ): string | undefined => {
    if (!value.trim()) {
      const fieldNames: Record<string, string> = {
        name: "Group Name",
        description: "Description",
      };
      return `${fieldNames[field]} is required`;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateField("name", values.name);
    newErrors.description = validateField("description", values.description);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all required fields as touched
    setTouched({
      name: true,
      description: true,
    });

    if (validateForm()) {
      onSubmit({
        ...values,
        id: group.id,
      });
    }
  };

  const handleChange = (field: keyof FormFieldValues, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <Form id={id} onSubmit={handleSubmit}>
      <FormGroup label="Group Name" isRequired fieldId="group-name">
        <TextInput
          id="group-name"
          name="name"
          value={values.name}
          onChange={(_, value) => handleChange("name", value)}
          onBlur={() => handleBlur("name")}
          validated={touched.name && errors.name ? "error" : "default"}
          aria-label="Group Name"
        />
        {touched.name && errors.name && (
          <HelperText>
            <HelperTextItem variant="error">{errors.name}</HelperTextItem>
          </HelperText>
        )}
      </FormGroup>

      <FormGroup label="Description" isRequired fieldId="group-description">
        <TextArea
          id="group-description"
          name="description"
          value={values.description}
          onChange={(_, value) => handleChange("description", value)}
          onBlur={() => handleBlur("description")}
          validated={
            touched.description && errors.description ? "error" : "default"
          }
          aria-label="Description"
          resizeOrientation="vertical"
        />
        {touched.description && errors.description && (
          <HelperText>
            <HelperTextItem variant="error">
              {errors.description}
            </HelperTextItem>
          </HelperText>
        )}
      </FormGroup>

      <FormGroup label="Icon" fieldId="group-icon">
        <TextInput
          id="group-icon"
          name="icon"
          value={values.icon}
          onChange={(_, value) => handleChange("icon", value)}
          aria-label="Icon"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Base64 encoded image or URL to partner icon
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </Form>
  );
};

EditGroupForm.displayName = "EditGroupForm";
