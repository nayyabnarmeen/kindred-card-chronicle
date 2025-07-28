import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyTreeView } from "@/components/FamilyTreeView";
import { FamilyMember, FamilyTree } from "@/types/family";
import { useToast } from "@/hooks/use-toast";
import { TreePine, Users } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([
    // Sample data
    {
      id: "family-1",
      headId: "head-1",
      name: "Johnson Family",
      members: [
        {
          id: "head-1",
          name: "Robert Johnson",
          gender: "male",
          relation: "head",
          isHead: true,
          birthDate: "1970-05-15"
        },
        {
          id: "spouse-1",
          name: "Mary Johnson",
          gender: "female",
          relation: "mother",
          isHead: false,
          spouseId: "head-1",
          birthDate: "1972-08-22"
        },
        {
          id: "child-1",
          name: "John Johnson",
          gender: "male",
          relation: "son",
          isHead: false,
          parentId: "head-1",
          birthDate: "1995-03-10"
        },
        {
          id: "child-2",
          name: "Sarah Johnson",
          gender: "female",
          relation: "daughter",
          isHead: false,
          parentId: "head-1",
          birthDate: "1998-12-05"
        }
      ]
    },
    {
      id: "family-2",
      headId: "head-2",
      name: "Smith Family", 
      members: [
        {
          id: "head-2",
          name: "Michael Smith",
          gender: "male",
          relation: "head",
          isHead: true,
          birthDate: "1965-11-30"
        },
        {
          id: "spouse-2",
          name: "Lisa Smith",
          gender: "female",
          relation: "mother",
          isHead: false,
          spouseId: "head-2",
          birthDate: "1968-04-18"
        }
      ]
    }
  ]);

  const handleEditMember = (member: FamilyMember) => {
    toast({
      title: "Edit Member",
      description: `Editing ${member.name}'s information`,
    });
  };

  const handleDeleteMember = (memberId: string) => {
    toast({
      title: "Member Deleted",
      description: "Family member has been removed",
      variant: "destructive",
    });
  };

  const handleAddMember = () => {
    toast({
      title: "Add Member",
      description: "Opening form to add new family member",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TreePine className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Family Tree App
            </h1>
          </div>
          <p className="text-muted-foreground">Manage and visualize your family connections</p>
        </div>

        <Tabs defaultValue="tree" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tree" className="gap-2">
              <TreePine className="w-4 h-4" />
              Family Tree
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Users className="w-4 h-4" />
              Manage Family
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="animate-fade-in">
            <FamilyTreeView
              familyTrees={familyTrees}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onAddMember={handleAddMember}
            />
          </TabsContent>

          <TabsContent value="manage" className="animate-fade-in">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Manage Family Members</h3>
              <p className="text-muted-foreground">This tab will contain the family management interface.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
