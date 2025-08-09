export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: string;
  relation: string; // Allow multiple relations like "head,father,husband"
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