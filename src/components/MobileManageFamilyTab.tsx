import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileFamilyMemberForm } from "./MobileFamilyMemberForm";
import { Plus, Users, Edit, Trash2, UserPlus, Heart, Calendar, HeartCrack } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FamilyMember {
  id?: string;
  name: string;
  gender?: 'male' | 'female';
  birth_date: string;
  is_deceased: boolean;
  death_date?: string;
  relation?: string; // Allow multiple relations like "head,father,husband"
  parent_id?: string;
  spouse_id?: string;
  is_head: boolean;
  photo_url?: string;
  marriage_date?: string;
  picture_url?: string;
}

interface MobileManageFamilyTabProps {
  onUpdateFamilyTrees?: (trees: any[]) => void;
}

export const MobileManageFamilyTab = ({ onUpdateFamilyTrees }: MobileManageFamilyTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
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

  const handleSaveMember = async (memberData: FamilyMember) => {
    try {
      setIsLoading(true);
      
      // Ensure required fields are properly formatted
      const dataToSave = {
        ...memberData,
        user_id: user?.id || null,
        name: memberData.name.trim(),
        birth_date: memberData.birth_date,
        is_deceased: Boolean(memberData.is_deceased),
        is_head: Boolean(memberData.is_head),
        death_date: memberData.is_deceased && memberData.death_date ? memberData.death_date : null,
        parent_id: memberData.parent_id && memberData.parent_id !== '' && memberData.parent_id !== 'new' ? memberData.parent_id : null,
        spouse_id: memberData.spouse_id && memberData.spouse_id !== '' && memberData.spouse_id !== 'new' ? memberData.spouse_id : null,
        marriage_date: memberData.marriage_date && memberData.marriage_date !== '' ? memberData.marriage_date : null,
        picture_url: memberData.picture_url && memberData.picture_url !== '' ? memberData.picture_url : null,
        photo_url: memberData.photo_url && memberData.photo_url !== '' ? memberData.photo_url : null,
        gender: memberData.gender || 'male',
        relation: memberData.relation || 'head'
      };

      console.log('Saving family member data:', dataToSave);

      if (editingMember?.id) {
        // Update existing member
        const { data, error } = await supabase
          .from('family_members')
          .update(dataToSave)
          .eq('id', editingMember.id)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        setFamilyMembers(prev => 
          prev.map(member => 
            member.id === editingMember.id ? { 
              ...data,
              gender: data.gender as 'male' | 'female'
            } as FamilyMember : member
          )
        );
        
        toast({
          title: "Member Updated",
          description: `${memberData.name}'s information has been updated.`,
        });
      } else {
        // Add new member
        const { data, error } = await supabase
          .from('family_members')
          .insert([dataToSave])
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        setFamilyMembers(prev => [...prev, {
          ...data,
          gender: data.gender as 'male' | 'female'
        } as FamilyMember]);
        
        toast({
          title: "Member Added",
          description: `${memberData.name} has been added to the family.`,
        });
      }
      
      setShowForm(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving family member:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to save family member. Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Member Deleted",
        description: "Family member has been removed.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete family member. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Family Members</h2>
            <p className="text-sm text-slate-600">
              {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2 h-10"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {familyMembers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-soft-bg flex items-center justify-center">
            <Heart className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Start Your Family Tree</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Begin documenting your family history by adding your first family member.
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add First Member
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {familyMembers.map((member) => (
            <Card key={member.id} className="shadow-card border-0 overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        member.is_deceased 
                          ? 'bg-slate-100 border-2 border-slate-300' 
                          : 'gradient-bg'
                      }`}>
                        {member.is_deceased ? (
                          <HeartCrack className="w-6 h-6 text-slate-600" />
                        ) : (
                          <Heart className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">{member.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={member.is_head ? "default" : "secondary"}
                            className={member.is_head 
                              ? "gradient-bg text-white" 
                              : "bg-slate-100 text-slate-700"
                            }
                          >
                            {member.relation}
                          </Badge>
                          {member.gender && (
                            <Badge variant="outline" className="text-xs">
                              {member.gender}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Born: {new Date(member.birth_date).toLocaleDateString()}</span>
                      </div>
                      
                      {member.is_deceased && member.death_date && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <HeartCrack className="w-4 h-4" />
                          <span>Died: {new Date(member.death_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                      className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id!)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MobileFamilyMemberForm
        member={editingMember || undefined}
        onSave={handleSaveMember}
        onCancel={() => {
          setShowForm(false);
          setEditingMember(null);
        }}
        isVisible={showForm}
        existingMembers={familyMembers}
      />
    </div>
  );
};