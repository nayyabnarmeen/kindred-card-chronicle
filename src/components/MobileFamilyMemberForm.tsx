import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Heart, HeartCrack } from "lucide-react";

interface FamilyMember {
  id?: string;
  name: string;
  gender?: 'male' | 'female';
  birth_date: string;
  is_deceased: boolean;
  death_date?: string;
  relation?: 'father' | 'mother' | 'son' | 'daughter' | 'spouse' | 'head';
  parent_id?: string;
  spouse_id?: string;
  is_head: boolean;
  photo_url?: string;
}

interface MobileFamilyMemberFormProps {
  member?: FamilyMember;
  onSave: (member: FamilyMember) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const MobileFamilyMemberForm = ({ 
  member, 
  onSave, 
  onCancel, 
  isVisible 
}: MobileFamilyMemberFormProps) => {
  const [formData, setFormData] = useState<FamilyMember>({
    id: member?.id || '',
    name: member?.name || '',
    gender: member?.gender || 'male',
    birth_date: member?.birth_date || '',
    is_deceased: member?.is_deceased || false,
    death_date: member?.death_date || '',
    relation: member?.relation || 'head',
    parent_id: member?.parent_id || '',
    spouse_id: member?.spouse_id || '',
    is_head: member?.is_head || false,
    photo_url: member?.photo_url || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.birth_date) {
      toast({
        title: "Missing Information",
        description: "Name and birth date are required.",
        variant: "destructive"
      });
      return;
    }

    if (formData.is_deceased && !formData.death_date) {
      toast({
        title: "Missing Death Date",
        description: "Please provide death date for deceased members.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedMember: FamilyMember = {
        ...formData,
        is_head: formData.relation === 'head',
        death_date: formData.is_deceased ? formData.death_date : undefined
      };
      
      onSave(updatedMember);
      toast({
        title: "Success",
        description: member ? "Family member updated successfully" : "Family member added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save family member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant border-0 bg-gradient-to-br from-white to-slate-50 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              {member ? 'Edit Family Member' : 'Add Family Member'}
            </CardTitle>
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-slate-700">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value: "male" | "female") => 
                  setFormData(prev => ({ ...prev, gender: value }))
                }>
                  <SelectTrigger className="h-12 text-base border-slate-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relation" className="text-sm font-medium text-slate-700">
                  Relation
                </Label>
                <Select value={formData.relation} onValueChange={(value: any) => 
                  setFormData(prev => ({ ...prev, relation: value }))
                }>
                  <SelectTrigger className="h-12 text-base border-slate-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">Head</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="son">Son</SelectItem>
                    <SelectItem value="daughter">Daughter</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date" className="text-sm font-medium text-slate-700">
                Birth Date *
              </Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                required
              />
            </div>

            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartCrack className="w-4 h-4 text-slate-600" />
                  <Label htmlFor="is_deceased" className="text-sm font-medium text-slate-700">
                    Deceased
                  </Label>
                </div>
                <Switch
                  id="is_deceased"
                  checked={formData.is_deceased}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    is_deceased: checked,
                    death_date: checked ? prev.death_date : ''
                  }))}
                />
              </div>
              
              {formData.is_deceased && (
                <div className="space-y-2">
                  <Label htmlFor="death_date" className="text-sm font-medium text-slate-700">
                    Date of Death *
                  </Label>
                  <Input
                    id="death_date"
                    type="date"
                    value={formData.death_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, death_date: e.target.value }))}
                    className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                    required={formData.is_deceased}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 gradient-bg hover:opacity-90 transition-opacity gap-2"
                disabled={isLoading}
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};