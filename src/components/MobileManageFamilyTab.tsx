
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileFamilyMemberForm } from "./MobileFamilyMemberForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilyContext, FamilyMember } from "@/contexts/FamilyContext";
import { Plus, Search, User, Edit, Trash2, Crown, Heart, Users } from "lucide-react";

export const MobileManageFamilyTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const { familyMembers, isLoading, fetchFamilyMembers, addMember, updateMember, deleteMember } = useFamilyContext();
  const { toast } = useToast();
  const { user } = useAuth();

  const filteredMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.relation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveMember = async (memberData: FamilyMember): Promise<void> => {
    try {
      const cleanedData = {
        ...memberData,
        user_id: user?.id,
        is_head: memberData.relation === 'head' || memberData.relation?.includes('head') || memberData.is_head
      };

      if (memberData.id) {
        // Update existing member
        const { data, error } = await supabase
          .from('family_members')
          .update(cleanedData)
          .eq('id', memberData.id)
          .select()
          .single();

        if (error) throw error;
        
        updateMember(data);
        toast({
          title: "Member Updated",
          description: `${memberData.name} has been updated successfully.`,
        });
      } else {
        // Add new member
        const { data, error } = await supabase
          .from('family_members')
          .insert([cleanedData])
          .select()
          .single();

        if (error) throw error;
        
        addMember(data);
        toast({
          title: "Member Added", 
          description: `${memberData.name} has been added to your family tree.`,
        });
      }

      setShowForm(false);
      setEditingMember(null);
      
      // Refresh data to ensure cross-tab visibility
      await fetchFamilyMembers();
    } catch (error: any) {
      console.error('Save member error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save family member. Please try again.",
        variant: "destructive"
      });
      throw error;
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

      deleteMember(memberId);
      toast({
        title: "Member Deleted",
        description: "Family member has been removed.",
        variant: "destructive",
      });
      
      // Refresh data to ensure cross-tab visibility
      await fetchFamilyMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRelationIcon = (relation?: string) => {
    if (relation?.includes('head')) return Crown;
    if (relation?.includes('spouse')) return Heart;
    if (relation?.includes('son') || relation?.includes('daughter')) return Users;
    return User;
  };

  const getRelationColor = (relation?: string) => {
    if (relation?.includes('head')) return 'bg-primary/20 text-primary border-primary/30';
    if (relation?.includes('spouse')) return 'bg-pink-100 text-pink-700 border-pink-300';
    if (relation?.includes('son') || relation?.includes('daughter')) return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">All Family</h2>
            <p className="text-sm text-slate-600">
              {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2 h-10"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search family members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
        />
      </div>

      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-soft-bg flex items-center justify-center">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No Members Found' : 'No Family Members Yet'}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start building your family tree by adding your first family member.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Member
              </Button>
            )}
          </div>
        ) : (
          filteredMembers.map((member) => {
            const IconComponent = getRelationIcon(member.relation);
            return (
              <Card 
                key={member.id} 
                className={`shadow-card border-0 overflow-hidden transition-all hover:shadow-lg ${getRelationColor(member.relation)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-slate-900 truncate">{member.name}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {member.is_head && (
                              <Badge className="gradient-bg text-white text-xs">
                                Family Head
                              </Badge>
                            )}
                            {member.gender && (
                              <Badge variant="outline" className="text-xs">
                                {member.gender}
                              </Badge>
                            )}
                            {member.relation && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {member.relation.replace(',', ', ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600 mb-4 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                        <div className="grid grid-cols-2 gap-2">
                          <p><span className="font-medium">Born:</span> {new Date(member.birth_date).toLocaleDateString()}</p>
                          {member.profession && (
                            <p><span className="font-medium">Job:</span> {member.profession}</p>
                          )}
                          {member.residence && (
                            <p><span className="font-medium">Lives:</span> {member.residence}</p>
                          )}
                          {member.hometown && (
                            <p><span className="font-medium">From:</span> {member.hometown}</p>
                          )}
                        </div>
                        {member.note && (
                          <p className="text-xs bg-slate-50 p-2 rounded border"><span className="font-medium">Note:</span> {member.note}</p>
                        )}
                      </div>

                      {/* Quick Actions for Family Heads */}
                      {(member.is_head || member.relation?.includes('head')) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newMember = {
                                name: '',
                                gender: member.gender === 'male' ? 'female' : 'male',
                                birth_date: '',
                                is_deceased: false,
                                is_head: false,
                                relation: 'spouse',
                                spouse_id: member.id
                              } as FamilyMember;
                              setEditingMember(newMember);
                              setShowForm(true);
                            }}
                            className="h-8 text-xs gap-1"
                          >
                            <Heart className="w-3 h-3" />
                            Add Spouse
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newMember = {
                                name: '',
                                gender: 'male',
                                birth_date: '',
                                is_deceased: false,
                                is_head: false,
                                relation: 'son',
                                parent_id: member.id
                              } as FamilyMember;
                              setEditingMember(newMember);
                              setShowForm(true);
                            }}
                            className="h-8 text-xs gap-1"
                          >
                            <Users className="w-3 h-3" />
                            Add Child
                          </Button>
                        </div>
                      )}
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
            );
          })
        )}
      </div>

      <MobileFamilyMemberForm
        member={editingMember || undefined}
        onSave={handleSaveMember}
        onCancel={() => {
          setShowForm(false);
          setEditingMember(null);
        }}
        isVisible={showForm}
        existingMembers={familyMembers}
        onMemberAdded={(member) => {
          // Refresh all data when a new member is added to ensure cross-tab visibility
          fetchFamilyMembers();
        }}
      />
    </div>
  );
};
