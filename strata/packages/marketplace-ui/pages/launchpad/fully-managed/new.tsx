import { FullyManagedForm } from "../../../src/components/form/FullyManagedForm";
import { FormContainer } from "../../../src/components/FormContainer";
import { NextPage } from "next";

export const NewFullymanaged: NextPage = () => {
  return (
    <FormContainer title="New Whirliehydronka">
      <FullyManagedForm />
    </FormContainer>
  );
};

export default NewFullymanaged;
