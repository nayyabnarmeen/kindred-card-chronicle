import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FamilyMember, FamilyTree } from "@/types/family";
import { MobileFamilyMemberForm } from "./MobileFamilyMemberForm";
import { Plus, Users, Edit, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileManageFamilyTabProps {
  familyTrees: FamilyTree[];
  onUpdateFamilyTrees: (trees: FamilyTree[]) => void;
}

export const MobileManageFamilyTab = ({ 
  familyTrees, 
  onUpdateFamilyTrees 
}: MobileManageFamilyTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const { toast } = useToast();

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
      // Add new member
      const newMember = {
        ...memberData,
        id: crypto.randomUUID(),
        isHead: memberData.relation === "head",
      } as FamilyMember;

      if (newMember.isHead) {
        // Create new family tree
        const newFamilyTree: FamilyTree = {
          id: crypto.randomUUID(),
          headId: newMember.id,
          name: `${newMember.name} Family`,
          members: [newMember]
        };
        onUpdateFamilyTrees([...familyTrees, newFamilyTree]);
      } else {
        // Add to existing family tree (for now, add to first one)
        if (familyTrees.length > 0) {
          const updatedTrees = familyTrees.map((tree, index) => 
            index === 0 
              ? { ...tree, members: [...tree.members, newMember] }
              : tree
          );
          onUpdateFamilyTrees(updatedTrees);
        }
      }
      
      toast({
        title: "Member Added",
        description: `${memberData.name} has been added to the family.`,
      });
    }
    
    setShowForm(false);
    setEditingMember(null);
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

  const allMembers = familyTrees.flatMap(tree => tree.members);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <h2 className="text-xl font-semibold">Family Members</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 h-10"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {allMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Family Members</h3>
          <p className="text-muted-foreground mb-4 text-sm px-4">
            Start building your family tree by adding your first family member.
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add First Member
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {familyTrees.map((tree) => (
            <div key={tree.id} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  {tree.name}
                </h3>
              </div>
              
              {tree.members.map((member) => (
                <Card key={member.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{member.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {member.relation}
                        </p>
                        {member.birthDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Born: {new Date(member.birthDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMember(member)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
      />
    </div>
  );
};