import { useState } from "react";
import { FamilyTree, FamilyMember as OldFamilyMember } from "@/types/family";
import { FamilyHeadCard } from "./FamilyHeadCard";
import { FamilyMemberNode } from "./FamilyMemberNode";
import { MobileFamilyMemberForm } from "./MobileFamilyMemberForm";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Users } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

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
}

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
  const { toast } = useToast();

  const toggleFamily = (familyId: string) => {
    const newExpanded = new Set(expandedFamilies);
    if (newExpanded.has(familyId)) {
      newExpanded.delete(familyId);
    } else {
      newExpanded.add(familyId);
    }
    setExpandedFamilies(newExpanded);
  };

  const organizeFamily = (members: FamilyMember[], headId: string) => {
    const head = members.find(m => m.id === headId);
    const spouse = members.find(m => m.spouse_id === headId);
    const children = members.filter(m => m.parent_id === headId);
    
    return { head, spouse, children };
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedTrees = familyTrees.map(tree => ({
      ...tree,
      members: tree.members.filter(member => member.id !== memberId)
    })).filter(tree => tree.members.length > 0);
    
    onUpdateFamilyTrees(updatedTrees);
    toast({
      title: "Member Deleted",
      description: "Family member has been removed.",
      variant: "destructive",
    });
  };

  const handleSaveMember = async (memberData: FamilyMember): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (editingMember) {
        // Update existing member
        const updatedTrees = familyTrees.map(tree => ({
          ...tree,
          members: tree.members.map(member => 
            member.id === editingMember.id 
              ? { ...member, ...memberData }
              : member
          )
        }));
        onUpdateFamilyTrees(updatedTrees);
        toast({
          title: "Member Updated",
          description: `${memberData.name}'s information has been updated.`,
        });
      } else {
        // Add new member as family head
        const newMember = {
          ...memberData,
          id: crypto.randomUUID(),
          is_head: true,
          relation: "head",
        } as FamilyMember;

        const newFamilyTree: FamilyTree = {
          id: crypto.randomUUID(),
          headId: newMember.id!,
          name: `${newMember.name} Family`,
          members: [newMember as any]
        };
        
        onUpdateFamilyTrees([...familyTrees, newFamilyTree]);
        toast({
          title: "Family Head Added",
          description: `${memberData.name} has been added as a new family head.`,
        });
      }
      
      setShowForm(false);
      setEditingMember(null);
      resolve();
    });
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Male Family Heads</h2>
            <p className="text-sm text-slate-600">View-only family trees</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2 h-10">
          <Plus className="w-4 h-4" />
          Add Head
        </Button>
      </div>

      <div className="space-y-3">
        {familyTrees
          .filter(tree => {
            const headMember = tree.members.find(m => m.id === tree.headId);
            return headMember?.gender === 'male';
          })
          .map((familyTree) => {
            const headMember = familyTree.members.find(m => m.id === familyTree.headId);
            if (!headMember) return null;

            const isExpanded = expandedFamilies.has(familyTree.id);
            const { head, spouse, children } = organizeFamily(familyTree.members as any[], familyTree.headId);

            return (
              <div key={familyTree.id} className="space-y-3">
                <FamilyHeadCard
                  familyTree={familyTree}
                  headMember={headMember}
                  onExpand={toggleFamily}
                  isExpanded={isExpanded}
                />

                <Collapsible open={isExpanded}>
                  <CollapsibleContent className="px-4 space-y-4">
                    <div className="animate-fade-in">
                      {/* Parents Row */}
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        {head && (
                          <FamilyMemberNode
                            member={head as any}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            level={0}
                            viewOnly={true}
                          />
                        )}
                        {spouse && (
                          <FamilyMemberNode
                            member={spouse as any}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            level={0}
                            viewOnly={true}
                          />
                        )}
                      </div>

                      {/* Connection Line */}
                      {children.length > 0 && (
                        <div className="flex justify-center mb-4">
                          <div className="w-px h-6 bg-border"></div>
                        </div>
                      )}

                      {/* Children Row */}
                      {children.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                          {children.map((child) => (
                            <FamilyMemberNode
                              key={child.id}
                              member={child as any}
                              onEdit={() => {}}
                              onDelete={() => {}}
                              level={1}
                              viewOnly={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}

        {familyTrees.filter(tree => {
          const headMember = tree.members.find(m => m.id === tree.headId);
          return headMember?.gender === 'male';
        }).length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Male Family Heads</h3>
            <p className="text-muted-foreground mb-4 text-sm px-4">
              Add your first male family head to start building the family tree.
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Male Head
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
        }}
        isVisible={showForm}
      />
    </div>
  );
};