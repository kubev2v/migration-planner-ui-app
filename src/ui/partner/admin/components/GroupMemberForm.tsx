import { yupResolver } from "@hookform/resolvers/yup";
import type {
  Member,
  MemberCreate,
} from "@openshift-migration-advisor/planner-sdk";
import { Form } from "@patternfly/react-core";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import { TextInputFormGroup } from "../../../core/components/form";

export type CreateGroupMemberFormValues = MemberCreate;

const validationSchema: yup.ObjectSchema<CreateGroupMemberFormValues> = yup
  .object()
  .shape({
    username: yup.string().trim().required("Username is required"),
    email: yup
      .string()
      .trim()
      .email("Email must be valid")
      .required("Email is required"),
  });

interface BaseGroupMemberFormProps {
  id: string;
  setIsValid?: (isValid: boolean) => void;
}

interface EditGroupMemberFormProps extends BaseGroupMemberFormProps {
  member: Member;
  onSubmit: (values: Member) => void;
}

interface CreateGroupMemberFormProps extends BaseGroupMemberFormProps {
  member?: never;
  onSubmit: (values: CreateGroupMemberFormValues) => void;
}

export type GroupMemberFormProps =
  | EditGroupMemberFormProps
  | CreateGroupMemberFormProps;

export const GroupMemberForm: React.FC<GroupMemberFormProps> = ({
  id,
  member,
  onSubmit,
  setIsValid,
}) => {
  const methods = useForm<CreateGroupMemberFormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onTouched",
    defaultValues: member
      ? {
          username: member.username,
          email: member.email,
        }
      : {
          username: "",
          email: "",
        },
  });

  useEffect(() => {
    setIsValid?.(methods.formState.isValid);
  }, [methods.formState.isValid, setIsValid]);

  const handleFormSubmit = (data: CreateGroupMemberFormValues) => {
    if (member) {
      onSubmit({
        ...member,
        username: data.username,
        email: data.email,
      });
    } else {
      onSubmit(data);
    }
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
          label="Username"
          id="member-username"
          name="username"
          isRequired
          isDisabled={!!member}
          placeholder="Example: johndoe"
        />

        <TextInputFormGroup
          label="Email"
          id="member-email"
          name="email"
          isRequired
          placeholder="Example: john.doe@example.com"
        />
      </Form>
    </FormProvider>
  );
};

GroupMemberForm.displayName = "GroupMemberForm";
