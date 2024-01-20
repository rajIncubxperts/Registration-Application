import { useState, useEffect, ChangeEvent } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Form, Button, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";
import CustomModal from "../../components/modal";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../configuration/config";
import { Relationship, Gender, UserRole } from "../../constants/enum";
import { FamilyMember, Country, Student } from "../../interface/types";
import { get, del, post, put } from "../../helpers/apiHelper";
import { ToastContainer, toast } from "react-toastify";

function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFamilyMemberIndex, setSelectedFamilyMemberIndex] = useState<
    number | null
  >(null);
  const [selectedRole, setSelectedRole] = useState<string>("User");
  const [countries, setCountries] = useState<Country[]>([]);
  const [studentId, setStudentID] = useState();
  const [formData, setFormData] = useState<Student>({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: null,
    nationalityId: "Select nationality",
    familyMembers: [],
    status: "Pending",
  });
  const [showFamilyMemberForm, setShowFamilyMemberForm] = useState(true);
  const [submittedFamilyMembers, setSubmittedFamilyMembers] = useState<
    FamilyMember[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdminStaff = selectedRole === "Admin Staff";
  const isUser = selectedRole === "User";

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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
    setShowFamilyMemberForm(true);
    setSubmittedFamilyMembers([]);
  };

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setModalOpen(true);
    resetForm();
  };

  const editModal = (student: Student) => {
    setStudentID(student);
    fetchFamilyMembers(`${student}`);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  useEffect(() => {
    fetchData();
    fetchCountries();
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      const response = await get("/students");
      // Filter students based on the search input
      const filteredStudents = response?.data.filter((student: Student) =>
        Object.values(student)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setStudents(filteredStudents || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const countriesResponse = await get("/students/countries");
      setCountries(countriesResponse?.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchFamilyMembers = async (studentId: string) => {
    try {
      const response = await get(`/students/${studentId}/FamilyMembers`);
      setFormData(response[0] || []);
      setSubmittedFamilyMembers(response[0].familyMembers || []);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  const handleDeleteFamilyMemberSubmit = (index: number) => {
    const updatedFamilyMembers = [...submittedFamilyMembers];
    updatedFamilyMembers.splice(index, 1);
    setSubmittedFamilyMembers(updatedFamilyMembers);
  };

  const handleDeleteFamilyMember = async (
    index: number,
    familyMemberId: string | undefined
  ) => {
    try {
      if (!familyMemberId) {
        handleDeleteFamilyMemberSubmit(index);
        console.error("Invalid family member ID");
        return;
      }
      await del(`/familyMember/${familyMemberId}`);
      toast.success("Family member deleted successfully!");
      handleDeleteFamilyMemberSubmit(index);
    } catch (error) {
      console.error(
        `Error deleting family member with ID ${familyMemberId}:`,
        error
      );
      toast.error("Error deleting family member. Please try again.");
    }
  };

  const handleDeleteStudent = async (studentId: string | undefined) => {
    try {
      if (!studentId) {
        console.error("Invalid student ID");
        return;
      }

      const response = await fetch(`${BASE_URL}/students/${studentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchData();
        toast.success("Student deleted successfully!:");
      } else {
        console.error(
          `Error deleting student with ID ${studentId}:`,
          response.statusText
        );
        toast.error("Error deleting student. Please try again.");
      }
    } catch (error) {
      console.error(`Error deleting student with ID ${studentId}:`, error);
      toast.error("Error deleting student. Please try again.");
    }
  };

  const handleConfirmAction = async () => {
    if (selectedStudent) {
      await handleAddStudent();
    } else {
      await handleUpdateStudent();
    }
  };

  const handleUpdateStudent = async () => {
    try {
      if (!studentId) {
        return;
      }
      const updateRequestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationalityId: formData.nationalityId,
      };

      await put(`/students/${studentId}`, updateRequestBody);

      const updatedFamilyMembers = await Promise.all(
        submittedFamilyMembers.map(async (familyMember) => {
          const familyMemberUpdateRequestBody = {
            name: familyMember.name,
            relation: familyMember.relation,
            nationalityId: familyMember.nationalityId,
          };

          const response = await put(
            `/familyMember/${familyMember._id}`,
            familyMemberUpdateRequestBody
          );
          console.log(
            `Family member with ID ${familyMember._id} updated successfully!`
          );

          return response.data;
        })
      );

      fetchFamilyMembers(studentId);
      setSubmittedFamilyMembers(updatedFamilyMembers);
      fetchData();
      closeModal();
      toast.success("Student details member Updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Error updating student:" + error);
    }
  };

  const handleAddStudent = async () => {
    try {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.gender ||
        !formData.dateOfBirth
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }
      const studentRequestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationalityId: formData.nationalityId,
      };
      const { data } = await post("/students", studentRequestBody);
      const studentId = data?._id;
      await post(
        `/students/${studentId}/FamilyMembers`,
        submittedFamilyMembers
      );
      toast.success("Student details added successfully!");
      fetchData();
      closeModal();
    } catch (error) {
      toast.error("Error adding student and family member:" + error);
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
        { name: "", relation: "", nationalityId: "Select nationality" },
      ],
    });
    setShowFamilyMemberForm(false);
  };

  const validateFamilyMember = (familyMember: FamilyMember) => {
    return (
      familyMember.name &&
      familyMember.relation &&
      familyMember.nationalityId !== "Select nationality"
    );
  };

  // Update the form data with the selected family member
  const handleRowClick = (index: number) => {
    setSelectedFamilyMemberIndex(index);
    const selectedFamilyMember = submittedFamilyMembers[index];
    setFormData({
      ...formData,
      familyMembers: [selectedFamilyMember],
    });
    setShowFamilyMemberForm(false);
  };

  const handleSubmitFamilyMember = () => {
    if (selectedFamilyMemberIndex !== null) {
      // If checkbox is checked, update existing family member
      const updatedFamilyMembers = [...submittedFamilyMembers];
      updatedFamilyMembers[selectedFamilyMemberIndex] =
        formData.familyMembers[0];
      setSubmittedFamilyMembers(updatedFamilyMembers);
      setShowFamilyMemberForm(true);
      setSelectedFamilyMemberIndex(null);
    } else {
      // If checkbox is not checked, add a new family member
      const newFamilyMember = formData.familyMembers[0];
      if (validateFamilyMember(newFamilyMember)) {
        setSubmittedFamilyMembers([...submittedFamilyMembers, newFamilyMember]);
        setShowFamilyMemberForm(true);
      } else {
        toast.error(
          "Please fill in all required fields for the family member."
        );
      }
    }
  };

  const handleFamilyMemberChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedFamilyMembers = [...formData.familyMembers];
    updatedFamilyMembers[index] = {
      ...updatedFamilyMembers[index],
      [field]: value,
    };
    setFormData((prevFormData) => ({
      ...prevFormData,
      familyMembers: updatedFamilyMembers,
    }));
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

      await post<Student>(`${BASE_URL}/students/${studentId}/${newStatus}`, {});
      fetchData();
    } catch (error) {
      console.error(
        `Error changing status for student with ID ${studentId}:`,
        error
      );
    }
  };

  const renderFamilyMembers = () => {
    return (
      <div>
        <Table striped bordered hover responsive>
          {submittedFamilyMembers && submittedFamilyMembers.length > 0 && (
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Relationship</th>
                <th>Nationality</th>
                <th>Action</th>
                <th>Edit</th>
              </tr>
            </thead>
          )}
          <tbody>
            {submittedFamilyMembers.map((familyMember, index) => (
              <tr key={index} style={{ cursor: "pointer" }}>
                <td>{index + 1}</td>
                <td className="text-truncate truncate">{familyMember.name}</td>
                <td className="text-truncate truncate">
                  {familyMember.relation}
                </td>
                <td className="text-truncate truncate">
                  {countries.find(
                    (country) => country._id === familyMember.nationalityId
                  )?.countryName || ""}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleDeleteFamilyMember(index, familyMember._id)
                    }
                    disabled={isAdminStaff && !!formData._id}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </td>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedFamilyMemberIndex === index}
                    onChange={() => handleRowClick(index)}
                    disabled={isAdminStaff && !!formData._id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {!showFamilyMemberForm && (
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={
                formData.familyMembers[formData.familyMembers?.length - 1]?.name
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
              disabled={isAdminStaff && !!formData._id}
            />
            <Form.Control
              as="select"
              value={
                formData.familyMembers[formData.familyMembers.length - 1]
                  ?.relation
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
              disabled={isAdminStaff && !!formData._id}
            >
              <option value="">Select relationship</option>
              {Object.values(Relationship).map((relation) => (
                <option key={relation} value={relation}>
                  {relation}
                </option>
              ))}
            </Form.Control>
            <Form.Control
              as="select"
              value={
                formData.familyMembers[formData.familyMembers.length - 1]
                  ?.nationalityId
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
              disabled={isAdminStaff && !!formData._id}
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

        {!formData._id && showFamilyMemberForm && (
          <Button variant="success" size="sm" onClick={handleAddFamilyMember}>
            Add Family Member
          </Button>
        )}
      </div>
    );
  };

  const columns: TableColumn<Student>[] = [
    { name: "First Name", selector: (row) => row.firstName, sortable: true },
    { name: "Last Name", selector: (row) => row.lastName, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    {
      name: "Nationality",
      selector: (row) =>
        countries.find((country) => country._id === row.nationalityId)
          ?.countryName || "",
      sortable: true,
    },
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
              <FontAwesomeIcon icon={faTrash} />
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={() => handleStatusChange(row._id, "Accepted")}
              className="mx-1"
            >
              <FontAwesomeIcon icon={faCheck} />
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStatusChange(row._id, "Rejected")}
              className="mx-1"
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </>
        ),
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    table: {
      style: {
        border: "1px solid grey",
      },
    },
    headCells: {
      style: {
        backgroundColor: "black",
        color: "white",
        border: "1px solid white",
      },
      rows: {
        style: {
          borderBottom: "1px solid red",
        },
      },
    },
  };

  return (
    <>
      <ToastContainer />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <h2>Registration Application</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Form.Control
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginRight: "10px" }}
          />
          <Form.Select
            //variant="success"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            id="dropdown-basic"
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
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
          title="Student Information"
          columns={columns}
          data={students}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50]}
          onRowClicked={(row) => !isUser && editModal(row._id)}
          customStyles={customStyles}
        />
      </div>
      <CustomModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        title={selectedStudent ? "Add Student" : "Update Student"}
        onConfirm={handleConfirmAction}
        action={selectedStudent ? "update" : "add"}
        isAdminStaff={isAdminStaff}
        selectedFamilyMembers={formData}
      >
        <Form.Group controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={formData.firstName}
            placeholder="Enter first name"
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
            disabled={isAdminStaff && !!formData._id}
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
            disabled={isAdminStaff && !!formData._id}
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
            disabled={isAdminStaff && !!formData._id}
          >
            <option value="">Select gender</option>
            {Object.values(Gender).map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
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
            disabled={isAdminStaff && !!formData._id}
          />
        </Form.Group>

        <Form.Group controlId="formNationality">
          <Form.Label>Nationality</Form.Label>
          <Form.Control
            as="select"
            value={formData.nationalityId}
            onChange={(e) =>
              setFormData({ ...formData, nationalityId: e.target.value })
            }
            required
            disabled={isAdminStaff && !!formData._id}
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
