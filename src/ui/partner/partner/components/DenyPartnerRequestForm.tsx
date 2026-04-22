import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@patternfly/react-core";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import { TextAreaFormGroup } from "../../../core/components/form";

export interface DenyPartnerRequestFormValues {
  reason: string;
}

const validationSchema: yup.ObjectSchema<DenyPartnerRequestFormValues> = yup
  .object()
  .shape({
    reason: yup.string().trim().required("Reason is required"),
  });

interface DenyPartnerRequestFormProps {
  id: string;
  onSubmit: (values: DenyPartnerRequestFormValues) => void;
  setIsValid?: (isValid: boolean) => void;
}

export const DenyPartnerRequestForm: React.FC<DenyPartnerRequestFormProps> = ({
  id,
  onSubmit,
  setIsValid,
}) => {
  const methods = useForm<DenyPartnerRequestFormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onTouched",
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    setIsValid?.(methods.formState.isValid);
  }, [methods.formState.isValid, setIsValid]);

  const handleFormSubmit = (data: DenyPartnerRequestFormValues) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <Form
        noValidate
        id={id}
        onSubmit={(e) => {
          void methods.handleSubmit(handleFormSubmit)(e);
        }}
      >
        <TextAreaFormGroup
          label="Reason for rejection"
          id="reject-reason"
          name="reason"
          isRequired
          placeholder="Please provide a reason for rejecting this request..."
        />
      </Form>
    </FormProvider>
  );
};

DenyPartnerRequestForm.displayName = "DenyPartnerRequestForm";
