import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FamilyMember } from "@/types/family";
import { X, Save } from "lucide-react";

interface MobileFamilyMemberFormProps {
  member?: FamilyMember;
  onSave: (member: Partial<FamilyMember>) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const MobileFamilyMemberForm = ({ 
  member, 
  onSave, 
  onCancel, 
  isVisible 
}: MobileFamilyMemberFormProps) => {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    gender: member?.gender || "male" as const,
    relation: member?.relation || "head" as const,
    birthDate: member?.birthDate || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: member?.id || crypto.randomUUID(),
      isHead: formData.relation === "head",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border shadow-lg animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            {member ? "Edit Member" : "Add New Member"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value: "male" | "female") => 
                setFormData(prev => ({ ...prev, gender: value }))
              }>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relation">Relation</Label>
              <Select value={formData.relation} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, relation: value }))
              }>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head">Family Head</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="son">Son</SelectItem>
                  <SelectItem value="daughter">Daughter</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="h-12 text-base"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 gap-2"
              >
                <Save className="h-4 w-4" />
                {member ? "Update" : "Add"} Member
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};