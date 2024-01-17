import { useState, useEffect } from "react";
import { get } from "../../helpers/apiHelper";
import DataTable, { TableColumn } from "react-data-table-component";
import { Form, Button, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomModal from "../../components/modal";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../configuration/config";

interface FamilyMember {
  name: string;
  relation: string;
  nationalityId: string;
}

interface Country {
  _id: string;
  countryName: string;
}

interface Student {
  _id?: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date | null;
  nationalityId: string;
  familyMembers: FamilyMember[];
  status: string;
}

function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("User");
  const [countries, setCountries] = useState<Country[]>([]);
  const [studentId, setStudentID] = useState();
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState([]);
  const [formData, setFormData] = useState<Student>({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: null,
    nationalityId: "Select nationality",
    familyMembers: [],
    status: "Pending",
  });
  const [showFamilyMemberForm, setShowFamilyMemberForm] = useState(false);
  const [submittedFamilyMembers, setSubmittedFamilyMembers] = useState<
    FamilyMember[]
  >([]);

  console.log(submittedFamilyMembers);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      dateOfBirth: null,
      nationalityId: "Select nationality",
      familyMembers: [],
      status: "",
    });
    setShowFamilyMemberForm(false);
  };

  const openModal = (student: Student) => {
    resetForm();
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const editModal = (student: Student) => {
    setStudentID(student);
    setModalOpen(true);
  };

  console.log('formData',formData)

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    resetForm();
  };

  useEffect(() => {
    fetchData();
    fetchCountries();
  }, []);

  useEffect(() => {
    studentId && fetchFamilyMembers(studentId);
  }, [studentId]);

  const fetchData = async () => {
    try {
      const response = await get(`${BASE_URL}/students`);
      setStudents(response?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const countriesResponse = await get<{ data: Country[] }>(
        `${BASE_URL}/students/countries`
      );
      setCountries(countriesResponse?.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchFamilyMembers = async (studentId: any) => {
    try {
      const response = await get(
        `${BASE_URL}/students/${studentId}/FamilyMembers`
      );
      setFormData(response[0] || [])
      setSubmittedFamilyMembers(response[0].foundRelations || []);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  const handleDeleteStudent = async (studentId: string | undefined) => {
    try {
      if (!studentId) {
        console.error("Invalid student ID");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/students/${studentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log(`Student with ID ${studentId} deleted successfully!`);
        fetchData();
      } else {
        console.error(
          `Error deleting student with ID ${studentId}:`,
          response.statusText
        );
      }
    } catch (error) {
      console.error(`Error deleting student with ID ${studentId}:`, error);
    }
  };

  const handleAddEmployee = async () => {
    try {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.gender ||
        !formData.dateOfBirth
      ) {
        console.error("Please fill in all required fields.");
        return;
      }

      // Step 1: Create the student request object
      const studentRequestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth.toISOString().split("T")[0],
        nationalityId: formData.nationalityId,
      };

      // Step 2: Make the API call to register the student
      const studentResponse = await fetch(
        `${BASE_URL}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentRequestBody),
        }
      );

      if (!studentResponse.ok) {
        console.error("Error adding student:", studentResponse.statusText);
        return;
      }

      const { data } = await studentResponse.json();
      const studentId = data?._id;
      const familyMemberResponse = await fetch(
        `${BASE_URL}/students/${studentId}/FamilyMembers`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submittedFamilyMembers),
        }
      );

      if (familyMemberResponse.ok) {
        console.log("Student and family member added successfully!");
        fetchData();
        closeModal();
      } else {
        console.error(
          "Error adding family member:",
          familyMemberResponse.statusText
        );
      }
    } catch (error) {
      console.error("Error adding student and family member:", error);
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handleDateInputChange = (date: Date | null) => {
    setFormData({ ...formData, dateOfBirth: date });
  };

  const handleAddFamilyMember = () => {
    setFormData({
      ...formData,
      familyMembers: [
        ...formData.familyMembers,
        { name: "", relation: "", nationalityId: "Select nationality" },
      ],
    });
    setShowFamilyMemberForm(true);
  };

  const validateFamilyMember = (familyMember: FamilyMember) => {
    return (
      familyMember.name &&
      familyMember.relation &&
      familyMember.nationalityId !== "Select nationality"
    );
  };

  const handleSubmitFamilyMember = () => {
    const newFamilyMember =
      formData.familyMembers[formData.familyMembers.length - 1];
    if (validateFamilyMember(newFamilyMember)) {
      setSubmittedFamilyMembers([...submittedFamilyMembers, newFamilyMember]);
      setShowFamilyMemberForm(false);
    } else {
      console.error(
        "Please fill in all required fields for the family member."
      );
    }
  };

  const handleFamilyMemberChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedFamilyMembers = [...formData.familyMembers];
    updatedFamilyMembers[index][field] = value;
    setFormData({ ...formData, familyMembers: updatedFamilyMembers });
  };

  const handleDeleteFamilyMemberSubmit = (index: number) => {
    const updatedFamilyMembers = [...submittedFamilyMembers];
    updatedFamilyMembers.splice(index, 1);
    setSubmittedFamilyMembers(updatedFamilyMembers);
  };
  const handleStatusChange = async (
    studentId: string | undefined,
    newStatus: string
  ) => {
    try {
      if (!studentId) {
        console.error("Invalid student ID");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/students/${studentId}/${newStatus}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log(
          `Student with ID ${studentId} status changed to ${newStatus} successfully!`
        );
        fetchData();
      } else {
        console.error(
          `Error changing status for student with ID ${studentId}:`,
          response.statusText
        );
      }
    } catch (error) {
      console.error(
        `Error changing status for student with ID ${studentId}:`,
        error
      );
    }
  };

  const renderFamilyMembers = () => {
    return (
      <>
          <Table striped bordered hover responsive>
          {submittedFamilyMembers.length > 0 && (
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Relationship</th>
                <th>Nationality</th>
                <th>Action</th>
              </tr>
            </thead>
            )}
            <tbody>
            {submittedFamilyMembers.map((familyMember, index) => (
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
            ))}
            </tbody>
          </Table>

        {showFamilyMemberForm && (
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={
                formData.familyMembers[formData.familyMembers.length - 1].name
              }
              onChange={(e) =>
                handleFamilyMemberChange(
                  formData.familyMembers.length - 1,
                  "name",
                  e.target.value
                )
              }
              className="mb-2"
              required
            />
            <Form.Control
              as="select"
              value={
                formData.familyMembers[formData.familyMembers.length - 1]
                  .relation
              }
              onChange={(e) =>
                handleFamilyMemberChange(
                  formData.familyMembers.length - 1,
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
              <option value="Mother">Uncle</option>
              <option value="Sibling">Sibling</option>
            </Form.Control>
            <Form.Control
              as="select"
              value={
                formData.familyMembers[formData.familyMembers.length - 1]
                  .nationalityId
              }
              onChange={(e) =>
                handleFamilyMemberChange(
                  formData.familyMembers.length - 1,
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
            <Button
              variant="success"
              size="sm"
              onClick={handleSubmitFamilyMember}
            >
              Submit
            </Button>
          </div>
        )}

        {selectedStudent && !showFamilyMemberForm && (
          <Button variant="success" size="sm" onClick={handleAddFamilyMember}>
            Add Family Member
          </Button>
        )}
      </>
    );
  };

  const columns: TableColumn<Student>[] = [
    { name: "First Name", selector: (row) => row.firstName, sortable: true },
    { name: "Last Name", selector: (row) => row.lastName, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    {
      name: "Date of Birth",
      selector: (row) =>
        row.dateOfBirth ? moment(row.dateOfBirth).format("DD-MM-YYYY") : "",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={row.status === "Accepted" ? "text-success" : "text-danger"}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      omit: selectedRole !== "Registrar",
      cell: (row) =>
        selectedRole === "Registrar" && (
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteStudent(row._id)}
              className="mx-1"
            >
              <FontAwesomeIcon icon={faTrash}/>
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={() => handleStatusChange(row._id, "Accepted")}
              className="mx-1"
            >
              <FontAwesomeIcon icon={faCheck}/>
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStatusChange(row._id, "Rejected")}
              className="mx-1"
            >
              <FontAwesomeIcon icon={faTimes}/>
            </Button>
          </>
        ),
    },
  ];
  console.log("selectedFamilyMembers>>>",selectedFamilyMembers?._id)

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <h2>List of Students</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Form.Select
            variant="success"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            id="dropdown-basic"
          >
            <option value="User">User</option>
            <option value="Staff">Admin Staff</option>
            <option value="Registrar">Registrar</option>
          </Form.Select>
          {selectedRole !== "User" && (
            <button
              type="button"
              className="btn btn-primary m-2"
              style={{ whiteSpace: "nowrap" }}
              onClick={openModal}
            >
              Create Student
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: "0px 20px" }}>
        <DataTable
          title="Student Data"
          columns={columns}
          data={students}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 20, 50]}
          onRowClicked={(row) => editModal(row._id)}
        />
      </div>
      <CustomModal
        selectedFamilyMembers={selectedFamilyMembers}
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={selectedStudent ? "Add Student" : "Update Student"}
        onConfirm={handleAddEmployee}
        action={selectedStudent ? "update" : "add"}
      >
        <Form.Group controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={ formData.firstName}
            placeholder="Enter first name"
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </Form.Group>

        <Form.Group controlId="formLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </Form.Group>

        <Form.Group controlId="formGender">
          <Form.Label>Gender</Form.Label>
          <Form.Control
            as="select"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
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
            selected={
              formData.dateOfBirth
                ? moment(formData.dateOfBirth).toDate()
                : null
            }
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
            value={formData.nationalityId
            }
            onChange={(e) =>
              setFormData({ ...formData, nationalityId: e.target.value })
            }
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
      </CustomModal>
    </>
  );
}

export default Home;
