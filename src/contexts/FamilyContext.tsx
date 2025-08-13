import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FamilyMember {
  id?: string;
  name: string;
  gender?: 'male' | 'female';
  birth_date: string;
  is_deceased: boolean;
  death_date?: string;
  relation?: string;
  parent_id?: string;
  spouse_id?: string;
  is_head: boolean;
  photo_url?: string;
  marriage_date?: string;
  picture_url?: string;
  profession?: string;
  residence?: string;
  hometown?: string;
  ethnic?: string;
  nationality?: string;
  note?: string;
}

interface FamilyContextType {
  familyMembers: FamilyMember[];
  isLoading: boolean;
  fetchFamilyMembers: () => Promise<void>;
  addMember: (member: FamilyMember) => void;
  updateMember: (member: FamilyMember) => void;
  deleteMember: (memberId: string) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const useFamilyContext = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamilyContext must be used within a FamilyProvider');
  }
  return context;
};

interface FamilyProviderProps {
  children: ReactNode;
}

export const FamilyProvider = ({ children }: FamilyProviderProps) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFamilyMembers = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('family_members')
        .select('*')
        .order('created_at', { ascending: true });

      // If user is authenticated, filter by user_id, otherwise show sample data
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Type assertion to match our interface
      setFamilyMembers((data as any[])?.map(item => ({
        ...item,
        gender: item.gender as 'male' | 'female'
      })) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load family members. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = (member: FamilyMember) => {
    setFamilyMembers(prev => [...prev, member]);
  };

  const updateMember = (updatedMember: FamilyMember) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  const deleteMember = (memberId: string) => {
    setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, [user]);

  const value: FamilyContextType = {
    familyMembers,
    isLoading,
    fetchFamilyMembers,
    addMember,
    updateMember,
    deleteMember,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};