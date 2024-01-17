import React from "react";
import { Form, Button } from "react-bootstrap";
import { Country, FamilyMember } from "../interface/api";

interface FamilyMemberFormProps {
  familyMember: FamilyMember;

  handleFamilyMemberChange: (
    index: number,
    field: string,
    value: string
  ) => void;
  handleSubmitFamilyMember: () => void;
  countries: Country[];
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  familyMember,
  handleFamilyMemberChange,
  handleSubmitFamilyMember,
  countries,
}) => {
  return (
    <div className="mb-3">
      <Form.Control
        type="text"
        placeholder="Enter name"
        value={familyMember.name}
        onChange={(e) =>
          handleFamilyMemberChange(familyMember.index, "name", e.target.value)
        }
        className="mb-2"
        required
      />
      <Form.Control
        as="select"
        value={familyMember.relation}
        onChange={(e) =>
          handleFamilyMemberChange(
            familyMember.index,
            "relation",
            e.target.value
          )
        }
        className="mb-2"
        required
      >
        <option value="">Select relationship</option>
        <option value="Father">Father</option>
        <option value="Mother">Mother</option>
        <option value="Uncle">Uncle</option>
        <option value="Sibling">Sibling</option>
      </Form.Control>
      <Form.Control
        as="select"
        value={familyMember.nationalityId}
        onChange={(e) =>
          handleFamilyMemberChange(
            familyMember.index,
            "nationalityId",
            e.target.value
          )
        }
        className="mb-2"
        required
      >
        <option value="Select nationality" disabled>
          Select nationality
        </option>
        {countries.map((country) => (
          <option key={country._id} value={country._id}>
            {country.countryName}
          </option>
        ))}
      </Form.Control>
      <Button variant="success" size="sm" onClick={handleSubmitFamilyMember}>
        Submit
      </Button>
    </div>
  );
};

export default FamilyMemberForm;
