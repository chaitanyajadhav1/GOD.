// app/dashboard/super-admin/invitations/components/InvitationForm.tsx
'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
}

interface InvitationFormProps {
  hospitals: Hospital[];
  selectedHospital?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvitationForm({ 
  hospitals, 
  selectedHospital, 
  onClose, 
  onSuccess 
}: InvitationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'DOCTOR',
    hospitalId: selectedHospital || '',
    permissions: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleHospitalChange = (value: string) => {
    setFormData(prev => ({ ...prev, hospitalId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.role || !formData.hospitalId) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await authenticatedFetch('/api/super-admin/invitations', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user to join a hospital
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospital">Hospital *</Label>
            <Select 
              value={formData.hospitalId} 
              onValueChange={handleHospitalChange} 
              required
            >
              <SelectTrigger id="hospital">
                <SelectValue placeholder="Select a hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Permissions (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="view-patients" />
                <Label 
                  htmlFor="view-patients" 
                  className="text-sm font-normal cursor-pointer"
                >
                  View Patients
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="manage-appointments" />
                <Label 
                  htmlFor="manage-appointments" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Manage Appointments
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="access-records" />
                <Label 
                  htmlFor="access-records" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Access Medical Records
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}