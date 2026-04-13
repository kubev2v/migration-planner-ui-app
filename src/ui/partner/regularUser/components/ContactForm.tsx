import {
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  HelperText,
  HelperTextItem,
  TextInput,
} from "@patternfly/react-core";
import React, { useState } from "react";

import type { Partner } from "../../../../models/PartnerModel";
import type { PartnerRequestValues } from "../../../../models/PartnerRequestModel";
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

interface FormErrors {
  customerName?: string;
  customerPointOfContactName?: string;
  email?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  id,
  partner,
  onSubmit,
}) => {
  const [values, setValues] = useState<FormFieldValues>({
    customerName: "",
    customerPointOfContactName: "",
    contactPhone: "",
    email: "",
    vcenterGeoLocation: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (
    field: keyof FormErrors,
    value: string,
  ): string | undefined => {
    if (field === "email") {
      if (!value.trim()) {
        return "Email is required";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    } else if (!value.trim()) {
      const fieldNames: Record<string, string> = {
        customerName: "Customer Name",
        customerPointOfContactName: "Customer Point Of Contact Name",
      };
      return `${fieldNames[field]} is required`;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.customerName = validateField("customerName", values.customerName);
    newErrors.customerPointOfContactName = validateField(
      "customerPointOfContactName",
      values.customerPointOfContactName,
    );
    newErrors.email = validateField("email", values.email);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all required fields as touched
    setTouched({
      customerName: true,
      customerPointOfContactName: true,
      email: true,
    });

    if (validateForm()) {
      onSubmit({
        ...values,
        partnerId: partner.id,
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
      <FormGroup label="Customer Name" isRequired fieldId="customer-name">
        <TextInput
          id="customer-name"
          name="customerName"
          value={values.customerName}
          onChange={(_, value) => handleChange("customerName", value)}
          onBlur={() => handleBlur("customerName")}
          validated={
            touched.customerName && errors.customerName ? "error" : "default"
          }
          aria-label="Customer Name"
        />
        {touched.customerName && errors.customerName && (
          <HelperText>
            <HelperTextItem variant="error">
              {errors.customerName}
            </HelperTextItem>
          </HelperText>
        )}
      </FormGroup>

      <FormGroup
        label="Customer Point Of Contact Name"
        isRequired
        fieldId="customer-point-of-contact-name"
      >
        <TextInput
          id="customer-point-of-contact-name"
          name="customerPointOfContactName"
          value={values.customerPointOfContactName}
          onChange={(_, value) =>
            handleChange("customerPointOfContactName", value)
          }
          onBlur={() => handleBlur("customerPointOfContactName")}
          validated={
            touched.customerPointOfContactName &&
            errors.customerPointOfContactName
              ? "error"
              : "default"
          }
          aria-label="Customer Point Of Contact Name"
        />
        {touched.customerPointOfContactName &&
          errors.customerPointOfContactName && (
            <HelperText>
              <HelperTextItem variant="error">
                {errors.customerPointOfContactName}
              </HelperTextItem>
            </HelperText>
          )}
      </FormGroup>

      <FormGroup label="Contact phone" fieldId="contact-phone">
        <TextInput
          id="contact-phone"
          name="contactPhone"
          type="tel"
          value={values.contactPhone}
          onChange={(_, value) => handleChange("contactPhone", value)}
          aria-label="Contact phone"
        />
      </FormGroup>

      <FormGroup label="Email" isRequired fieldId="email">
        <TextInput
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={(_, value) => handleChange("email", value)}
          onBlur={() => handleBlur("email")}
          validated={touched.email && errors.email ? "error" : "default"}
          aria-label="Email"
        />
        {touched.email && errors.email && (
          <HelperText>
            <HelperTextItem variant="error">{errors.email}</HelperTextItem>
          </HelperText>
        )}
      </FormGroup>

      <FormGroup label="vCenter Geo Location" fieldId="vcenter-geo-location">
        <FormSelect
          id="vcenter-geo-location"
          name="vcenterGeoLocation"
          value={values.vcenterGeoLocation}
          onChange={(_, value) => handleChange("vcenterGeoLocation", value)}
          aria-label="vCenter Geo Location"
        >
          <FormSelectOption value="" label="Select a region" isDisabled />
          {REGIONS.map((region) => (
            <FormSelectOption
              key={region.code}
              value={region.code}
              label={region.name}
            />
          ))}
        </FormSelect>
      </FormGroup>
    </Form>
  );
};

ContactForm.displayName = "ContactForm";
