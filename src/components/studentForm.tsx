
import React from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import moment from "moment";
import { FamilyMember, Country, Student } from "../interface/types";
import { Relationship } from "../../constants/enum";

interface StudentFormProps {
  formData: Student;
  countries: Country[];
  handleDateInputChange: (date: Date | null) => void;
  handleFamilyMemberChange: (
    index: number,
    field: string,
    value: string
  ) => void;
  renderFamilyMembers: () => React.ReactNode;
}

const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  countries,
  handleDateInputChange,
  handleFamilyMemberChange,
  renderFamilyMembers,
}) => {
  return (
    <>
      <Form.Group controlId="formFirstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.firstName}
          placeholder="Enter first name"
          onChange={(e) => handleFamilyMemberChange(0, "firstName", e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formLastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter last name"
          value={formData.lastName}
          onChange={(e) => handleFamilyMemberChange(0, "lastName", e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formGender">
        <Form.Label>Gender</Form.Label>
        <Form.Control
          as="select"
          value={formData.gender}
          onChange={(e) => handleFamilyMemberChange(0, "gender", e.target.value)}
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="formdateOfBirth">
        <Form.Label>Date of Birth</Form.Label>
        <DatePicker
          selected={formData.dateOfBirth ? moment(formData.dateOfBirth).toDate() : null}
          onChange={handleDateInputChange}
          dateFormat="dd/MM/yyyy"
          isClearable
          placeholderText="Select a date"
          customInput={<Form.Control style={{ width: "465px" }} />}
        />
      </Form.Group>

      <Form.Group controlId="formNationality">
        <Form.Label>Nationality</Form.Label>
        <Form.Control
          as="select"
          value={formData.nationalityId}
          onChange={(e) => handleFamilyMemberChange(0, "nationalityId", e.target.value)}
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
      </Form.Group>

      <hr className="my-4" />
      <h5>Family Information</h5>
      {renderFamilyMembers()}
    </>
  );
};

export default StudentForm;
