import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterviewStore, type Candidate } from '@/stores/interview';
import { User, Mail, Phone, CheckCircle } from 'lucide-react';

interface CollectInfoFormProps {
  candidate: Candidate;
}

export const CollectInfoForm = ({ candidate }: CollectInfoFormProps) => {
  const { updateCandidate } = useInterviewStore();
  const [formData, setFormData] = useState({
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    updateCandidate(candidate.id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      status: 'uploading', // Ready to start interview
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const missingFields = [
    { key: 'name', label: 'Full Name', icon: User, required: !formData.name },
    { key: 'email', label: 'Email Address', icon: Mail, required: !formData.email },
    { key: 'phone', label: 'Phone Number', icon: Phone, required: !formData.phone },
  ];

  const completedFields = missingFields.filter(f => !f.required);
  const requiredFields = missingFields.filter(f => f.required);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Complete Your Profile</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Please provide the following information to continue with your interview.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {missingFields.map((field) => {
            const Icon = field.icon;
            const hasValue = formData[field.key as keyof typeof formData];
            
            return (
              <div key={field.key} className="space-y-2">
                <Label 
                  htmlFor={field.key} 
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Icon className="w-4 h-4" />
                  {field.label}
                  {hasValue && <CheckCircle className="w-4 h-4 text-accent ml-auto" />}
                </Label>
                <Input
                  id={field.key}
                  type={field.key === 'email' ? 'email' : 'text'}
                  value={formData[field.key as keyof typeof formData]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  className={errors[field.key] ? 'border-destructive' : ''}
                />
                {errors[field.key] && (
                  <p className="text-xs text-destructive">{errors[field.key]}</p>
                )}
              </div>
            );
          })}

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={!formData.name || !formData.email || !formData.phone}
            >
              Continue to Interview
            </Button>
          </div>
        </form>

        {(completedFields.length > 0 || requiredFields.length > 0) && (
          <div className="mt-6 pt-4 border-t space-y-2">
            {completedFields.length > 0 && (
              <div className="text-xs text-muted-foreground">
                ✓ Completed: {completedFields.map(f => f.label).join(', ')}
              </div>
            )}
            {requiredFields.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Still needed: {requiredFields.map(f => f.label).join(', ')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};