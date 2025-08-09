import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyTreeView } from "@/components/FamilyTreeView";
import { MobileManageFamilyTab } from "@/components/MobileManageFamilyTab";
import { FamilyTree } from "@/types/family";
import { TreePine, Users } from "lucide-react";

const Index = () => {
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      <div className="safe-area-inset">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-20 border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <TreePine className="w-6 h-6 text-black" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Family Tree
            </h1>
          </div>
        </div>

        <Tabs defaultValue="tree" className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="tree" className="gap-2 text-xs">
              <TreePine className="w-4 h-4" />
              Male Heads
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2 text-xs">
              <Users className="w-4 h-4" />
              All Family
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="animate-fade-in px-4 pt-4">
            <FamilyTreeView
              familyTrees={familyTrees}
              onUpdateFamilyTrees={setFamilyTrees}
            />
          </TabsContent>

          <TabsContent value="manage" className="animate-fade-in px-4 pt-4">
            <MobileManageFamilyTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
