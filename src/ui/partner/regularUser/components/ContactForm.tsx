import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@patternfly/react-core";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import type { Partner } from "../../../../models/PartnerModel";
import type { PartnerRequestValues } from "../../../../models/PartnerRequestModel";
import {
  SelectFormGroup,
  TextInputFormGroup,
} from "../../../core/components/form";
import { REGIONS } from "../constants/regions";

interface FormFieldValues {
  customerName: string;
  customerPointOfContactName: string;
  contactPhone: string;
  email: string;
  vcenterGeoLocation: string;
}

interface ContactFormProps {
  id: string;
  partner: Partner;
  onSubmit: (values: PartnerRequestValues) => void;
}

const validationSchema: yup.ObjectSchema<FormFieldValues> = yup.object().shape({
  customerName: yup.string().trim().required("Customer name is required"),
  customerPointOfContactName: yup
    .string()
    .trim()
    .required("Customer point of contact name is required"),
  contactPhone: yup.string().trim().default(""),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  vcenterGeoLocation: yup.string().trim().default(""),
});

export const ContactForm: React.FC<ContactFormProps> = ({
  id,
  partner,
  onSubmit,
}) => {
  const methods = useForm<FormFieldValues>({
    resolver: yupResolver(validationSchema),
    mode: "onTouched",
    defaultValues: {
      customerName: "",
      customerPointOfContactName: "",
      contactPhone: "",
      email: "",
      vcenterGeoLocation: "",
    },
  });

  const handleFormSubmit = (data: FormFieldValues) => {
    onSubmit({
      ...data,
      partnerId: partner.id,
    });
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
        <TextInputFormGroup
          label="Customer name"
          id="customer-name"
          name="customerName"
          isRequired
        />

        <TextInputFormGroup
          label="Customer point of contact name"
          id="customer-point-of-contact-name"
          name="customerPointOfContactName"
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
          id="vcenter-geo-location"
          name="vcenterGeoLocation"
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
