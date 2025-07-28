import { useState } from "react";
import { FamilyTree, FamilyMember } from "@/types/family";
import { FamilyHeadCard } from "./FamilyHeadCard";
import { FamilyMemberNode } from "./FamilyMemberNode";
import { MobileFamilyMemberForm } from "./MobileFamilyMemberForm";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

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
    const spouse = members.find(m => m.spouseId === headId);
    const children = members.filter(m => m.parentId === headId);
    
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

  const handleSaveMember = (memberData: Partial<FamilyMember>) => {
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
        isHead: true,
        relation: "head" as const,
      } as FamilyMember;

      const newFamilyTree: FamilyTree = {
        id: crypto.randomUUID(),
        headId: newMember.id,
        name: `${newMember.name} Family`,
        members: [newMember]
      };
      
      onUpdateFamilyTrees([...familyTrees, newFamilyTree]);
      toast({
        title: "Family Head Added",
        description: `${memberData.name} has been added as a new family head.`,
      });
    }
    
    setShowForm(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <h2 className="text-xl font-semibold">Male Family Heads</h2>
        <Button onClick={() => setShowForm(true)} className="gap-2 h-10">
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
            const { head, spouse, children } = organizeFamily(familyTree.members, familyTree.headId);

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
                            member={head}
                            onEdit={handleEditMember}
                            onDelete={handleDeleteMember}
                            level={0}
                          />
                        )}
                        {spouse && (
                          <FamilyMemberNode
                            member={spouse}
                            onEdit={handleEditMember}
                            onDelete={handleDeleteMember}
                            level={0}
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
                              member={child}
                              onEdit={handleEditMember}
                              onDelete={handleDeleteMember}
                              level={1}
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