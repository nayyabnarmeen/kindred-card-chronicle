import { Card, CardContent } from "@/components/ui/card";
import { FamilyMember, FamilyTree } from "@/types/family";
import { Users, User } from "lucide-react";

interface FamilyHeadCardProps {
  familyTree: FamilyTree;
  headMember: FamilyMember;
  onExpand: (familyId: string) => void;
  isExpanded: boolean;
}

export const FamilyHeadCard = ({ familyTree, headMember, onExpand, isExpanded }: FamilyHeadCardProps) => {
  const familyCount = familyTree.members.length;
  
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover-scale bg-card/50 backdrop-blur-sm border-primary/20"
      onClick={() => onExpand(familyTree.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">{headMember.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{headMember.relation}</p>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              <span>{familyCount} family members</span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            isExpanded ? 'bg-primary' : 'bg-muted-foreground/40'
          }`} />
        </div>
      </CardContent>
    </Card>
  );
};