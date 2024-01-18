export interface FamilyMember {
    _id?: string;
    name: string;
    relation: string;
    nationalityId: string;
  }
  
  export interface Country {
    _id: string;
    countryName: string;
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
  