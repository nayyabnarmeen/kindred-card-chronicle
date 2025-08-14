import { useState, useEffect } from "react";
import { FamilyTree, FamilyMember as OldFamilyMember } from "@/types/family";
import { FamilyHeadCard } from "./FamilyHeadCard";
import { FamilyMemberNode } from "./FamilyMemberNode";
import { MobileFamilyMemberForm } from "./MobileFamilyMemberForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Users, Heart, Edit, Trash2, User, Crown } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useFamilyContext, FamilyMember } from "@/contexts/FamilyContext";

interface FamilyTreeViewProps {
  familyTrees: FamilyTree[];
  onUpdateFamilyTrees: (trees: FamilyTree[]) => void;
}

export const FamilyTreeView = ({ 
  familyTrees, 
  onUpdateFamilyTrees 
}: FamilyTreeViewProps) => {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [expandingFromHead, setExpandingFromHead] = useState<FamilyMember | null>(null);
  const { familyMembers, updateMember, deleteMember } = useFamilyContext();
  const { toast } = useToast();

  // Get family heads from context (members with head relation)
  const familyHeads = familyMembers.filter(member => 
    member.relation?.includes('head') || member.is_head
  );

  const toggleFamily = (familyId: string) => {
    const newExpanded = new Set(expandedFamilies);
    if (newExpanded.has(familyId)) {
      newExpanded.delete(familyId);
    } else {
      newExpanded.add(familyId);
    }
    setExpandedFamilies(newExpanded);
  };

  const organizeFamily = (headId: string) => {
    const head = familyMembers.find(m => m.id === headId);
    const spouse = familyMembers.find(m => m.spouse_id === headId);
    const children = familyMembers.filter(m => m.parent_id === headId);
    
    return { head, spouse, children };
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteMember(memberId);
      toast({
        title: "Member Deleted",
        description: "Family member has been removed.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExpandFamily = (head: FamilyMember) => {
    setExpandingFromHead(head);
    setShowForm(true);
  };

  const handleSaveMember = async (memberData: FamilyMember): Promise<void> => {
    // This will be handled by the parent component's save logic
    // The form will call the MobileManageFamilyTab's handleSaveMember
    return Promise.resolve();
  };

  const handleAddFamilyMember = (headMember: FamilyMember, relationType: 'spouse' | 'child') => {
    const newMember: Partial<FamilyMember> = {
      name: '',
      gender: 'male',
      birth_date: '',
      is_deceased: false,
      is_head: false,
      relation: relationType === 'spouse' ? 'spouse' : (headMember.gender === 'male' ? 'son' : 'daughter'),
    };

    if (relationType === 'spouse') {
      newMember.spouse_id = headMember.id;
      newMember.gender = headMember.gender === 'male' ? 'female' : 'male';
    } else {
      newMember.parent_id = headMember.id;
    }

    setEditingMember(newMember as FamilyMember);
    setExpandingFromHead(headMember);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Family Heads</h2>
            <p className="text-sm text-slate-600">
              {familyHeads.length} head{familyHeads.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2 h-10"
        >
          <Plus className="w-4 h-4" />
          Add Head
        </Button>
      </div>

      <div className="space-y-4">
        {familyHeads.map((headMember) => {
          const familyId = headMember.id!;
          const isExpanded = expandedFamilies.has(familyId);
          const { head, spouse, children } = organizeFamily(headMember.id!);

          return (
            <Card key={familyId} className="shadow-card border-0 overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">{headMember.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="gradient-bg text-white">
                            Family Head
                          </Badge>
                          {headMember.gender && (
                            <Badge variant="outline" className="text-xs">
                              {headMember.gender}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-600 mb-3">
                      <p>Born: {new Date(headMember.birth_date).toLocaleDateString()}</p>
                      {headMember.profession && <p>Profession: {headMember.profession}</p>}
                      {headMember.residence && <p>Lives in: {headMember.residence}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFamilyMember(headMember, 'spouse')}
                        className="h-8 text-xs gap-1"
                        disabled={!!spouse}
                      >
                        <Heart className="w-3 h-3" />
                        {spouse ? 'Has Spouse' : 'Add Spouse'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddFamilyMember(headMember, 'child')}
                        className="h-8 text-xs gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        Add Child
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFamily(familyId)}
                        className="h-8 text-xs"
                      >
                        {isExpanded ? 'Hide' : 'View'} Family ({children.length + (spouse ? 1 : 0)})
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(headMember)}
                      className="h-8 w-8 p-0 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(headMember.id!)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Collapsible open={isExpanded}>
                  <CollapsibleContent className="space-y-4">
                    <div className="animate-fade-in border-t pt-4">
                      {/* Spouse */}
                      {spouse && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Spouse</h5>
                          <Card className="bg-slate-50">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-slate-900">{spouse.name}</p>
                                  <p className="text-xs text-slate-600">
                                    Born: {new Date(spouse.birth_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMember(spouse)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Children */}
                      {children.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">
                            Children ({children.length})
                          </h5>
                          <div className="space-y-2">
                            {children.map((child) => (
                              <Card key={child.id} className="bg-slate-50">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-slate-900">{child.name}</p>
                                      <p className="text-xs text-slate-600">
                                        Born: {new Date(child.birth_date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditMember(child)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {children.length === 0 && !spouse && (
                        <div className="text-center py-4 text-slate-500">
                          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No family members added yet</p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}

        {familyHeads.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-soft-bg flex items-center justify-center">
              <Crown className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Family Heads</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Add your first family head to start organizing your family tree.
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2"
            >
              <Crown className="w-4 h-4" />
              Add First Head
            </Button>
          </div>
        )}
      </div>

      <MobileFamilyMemberForm
        member={editingMember || undefined}
        onSave={handleSaveMember}
        onCancel={() => {
          setShowForm(false);
          setEditingMember(null);
          setExpandingFromHead(null);
        }}
        isVisible={showForm}
        existingMembers={familyMembers}
      />
    </div>
  );
};