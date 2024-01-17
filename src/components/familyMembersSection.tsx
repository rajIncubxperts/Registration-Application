import React from "react";
import { Form, Button, Table } from "react-bootstrap";
import FamilyMemberForm from "./familyMemberForm";
import { Country, FamilyMember, Student } from "../interface/api";


interface FamilyMembersSectionProps {
  formData: Student;
  showFamilyMemberForm: boolean;
  submittedFamilyMembers: FamilyMember[];
  handleFamilyMemberChange: (
    index: number,
    field: string,
    value: string
  ) => void;
  handleDeleteFamilyMemberSubmit: (index: number) => void;
  handleAddFamilyMember: () => void;
  countries: Country[];
  handleSubmitFamilyMember: () => void;
}

const FamilyMembersSection: React.FC<FamilyMembersSectionProps> = ({
  formData,
  showFamilyMemberForm,
  submittedFamilyMembers,
  handleFamilyMemberChange,
  handleDeleteFamilyMemberSubmit,
  handleAddFamilyMember,
  countries,
  handleSubmitFamilyMember
}) => {
  return (
    <>
      {submittedFamilyMembers.map((familyMember, index) => (
          <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Relationship</th>
              <th>Nationality</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr key={index}>
              <td>{index + 1}</td>
              <td className="text-truncate">{familyMember.name}</td>
              <td className="text-truncate">{familyMember.relation}</td>
              <td className="text-truncate">
                {countries.find(
                  (country) => country._id === familyMember.nationalityId
                )?.countryName || ""}
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteFamilyMemberSubmit(index)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      ))}

      {showFamilyMemberForm && (
        <FamilyMemberForm
          familyMember={formData.familyMembers[formData.familyMembers.length - 1]}
          handleFamilyMemberChange={(index, field, value) =>
            handleFamilyMemberChange(index, field, value)
          }
          handleSubmitFamilyMember={() => handleSubmitFamilyMember()}
          countries={countries}
        />
      )}

      {formData && !showFamilyMemberForm && (
        <Button variant="success" size="sm" onClick={handleAddFamilyMember}>
          Add Family Member
        </Button>
      )}
    </>
  );
};

export default FamilyMembersSection;
