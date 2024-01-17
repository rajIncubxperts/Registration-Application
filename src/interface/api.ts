interface ApiError {
    status?: number;
    data?: object;
    message?: string;
  }

  export default ApiError


export interface Country {
  _id: string;
  countryName: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
  nationalityId: string;
  index: number;
}

export interface Student {
  _id?: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date | null;
  nationalityId: string;
  familyMembers: FamilyMember[];
  status: string;
}
