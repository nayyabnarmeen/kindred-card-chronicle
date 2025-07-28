import { useState } from "react";
import { FamilyTree, FamilyMember } from "@/types/family";
import { FamilyHeadCard } from "./FamilyHeadCard";
import { FamilyMemberNode } from "./FamilyMemberNode";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FamilyTreeViewProps {
  familyTrees: FamilyTree[];
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (memberId: string) => void;
  onAddMember: () => void;
}

export const FamilyTreeView = ({ 
  familyTrees, 
  onEditMember, 
  onDeleteMember, 
  onAddMember 
}: FamilyTreeViewProps) => {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Family Heads</h2>
        <Button onClick={onAddMember} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Family Head
        </Button>
      </div>

      <div className="space-y-4">
        {familyTrees.map((familyTree) => {
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
                <CollapsibleContent className="pl-8 space-y-4">
                  <div className="animate-fade-in">
                    {/* Parents Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {head && (
                        <FamilyMemberNode
                          member={head}
                          onEdit={onEditMember}
                          onDelete={onDeleteMember}
                          level={0}
                        />
                      )}
                      {spouse && (
                        <FamilyMemberNode
                          member={spouse}
                          onEdit={onEditMember}
                          onDelete={onDeleteMember}
                          level={0}
                        />
                      )}
                    </div>

                    {/* Connection Line */}
                    {children.length > 0 && (
                      <div className="flex justify-center mb-4">
                        <div className="w-px h-8 bg-border"></div>
                      </div>
                    )}

                    {/* Children Row */}
                    {children.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {children.map((child) => (
                          <FamilyMemberNode
                            key={child.id}
                            member={child}
                            onEdit={onEditMember}
                            onDelete={onDeleteMember}
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

        {familyTrees.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Family Heads Yet</h3>
            <p className="text-muted-foreground mb-4">Start building your family tree by adding the first family head.</p>
            <Button onClick={onAddMember} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Family Head
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};