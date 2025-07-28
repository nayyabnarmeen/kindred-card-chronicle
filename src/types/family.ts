export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: string;
  relation: 'father' | 'mother' | 'son' | 'daughter' | 'spouse' | 'head';
  parentId?: string;
  spouseId?: string;
  isHead: boolean;
  photo?: string;
}

export interface FamilyTree {
  id: string;
  headId: string;
  members: FamilyMember[];
  name: string;
}