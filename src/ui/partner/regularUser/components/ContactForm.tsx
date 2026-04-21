import { yupResolver } from "@hookform/resolvers/yup";
import type { PartnerRequestCreate } from "@openshift-migration-advisor/planner-sdk";
import { Form } from "@patternfly/react-core";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import {
  SelectFormGroup,
  TextInputFormGroup,
} from "../../../core/components/form";
import { REGIONS } from "../constants/regions";

interface ContactFormProps {
  id: string;
  onSubmit: (values: PartnerRequestCreate) => void;
}

const validationSchema: yup.ObjectSchema<PartnerRequestCreate> = yup
  .object()
  .shape({
    name: yup.string().trim().required("Customer name is required"),
    contactName: yup
      .string()
      .trim()
      .required("Customer point of contact name is required"),
    contactPhone: yup.string().trim().default(""),
    email: yup
      .string()
      .trim()
      .required("Email is required")
      .email("Please enter a valid email address"),
    location: yup.string().trim().default(""),
  });

export const ContactForm: React.FC<ContactFormProps> = ({ id, onSubmit }) => {
  const methods = useForm<PartnerRequestCreate>({
    resolver: yupResolver(validationSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      contactName: "",
      contactPhone: "",
      email: "",
      location: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <Form
        noValidate
        id={id}
        onSubmit={(e) => {
          void methods.handleSubmit(onSubmit)(e);
        }}
      >
        <TextInputFormGroup
          label="Customer name"
          id="name"
          name="name"
          isRequired
        />

        <TextInputFormGroup
          label="Customer point of contact name"
          id="contact-name"
          name="contactName"
          isRequired
        />

        <TextInputFormGroup
          label="Contact phone"
          id="contact-phone"
          name="contactPhone"
          type="tel"
        />

        <TextInputFormGroup
          label="Email"
          id="email"
          name="email"
          type="email"
          isRequired
        />

        <SelectFormGroup
          label="vCenter geo location"
          id="location"
          name="location"
          options={[
            { label: "Select a region", value: "" },
            ...REGIONS.map((region) => ({
              label: region.name,
              value: region.code,
            })),
          ]}
        />
      </Form>
    </FormProvider>
  );
};

ContactForm.displayName = "ContactForm";
