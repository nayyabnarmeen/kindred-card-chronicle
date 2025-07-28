import { Card, CardContent } from "@/components/ui/card";
import { FamilyMember } from "@/types/family";
import { User, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FamilyMemberNodeProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
  level: number;
}

export const FamilyMemberNode = ({ member, onEdit, onDelete, level }: FamilyMemberNodeProps) => {
  const getRelationColor = (relation: string) => {
    switch (relation) {
      case 'father':
      case 'head':
        return 'border-primary bg-primary/10';
      case 'mother':
        return 'border-accent bg-accent/10';
      case 'son':
      case 'daughter':
        return 'border-secondary bg-secondary/10';
      default:
        return 'border-muted bg-muted/10';
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-md ${getRelationColor(member.relation)}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{member.name}</h4>
            <p className="text-sm text-muted-foreground capitalize">{member.relation}</p>
            {member.birthDate && (
              <p className="text-xs text-muted-foreground">{member.birthDate}</p>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(member);
              }}
              className="h-8 w-8 p-0 hover:bg-primary/20"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(member.id);
              }}
              className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};