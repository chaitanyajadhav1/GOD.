// app/dashboard/super-admin/hospitals/components/HospitalsList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Plus, Search, Pencil, Mail, Trash2 } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
  email?: string;
  status: string;
  created_at: string;
  admin?: {
    email?: string;
  };
  creator: {
    email?: string;
  };
}

interface HospitalsListProps {
  hospitals: Hospital[];
  onEdit: (hospital: Hospital) => void;
  onRefresh: () => void;
}

export default function HospitalsList({ hospitals, onEdit, onRefresh }: HospitalsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (hospitals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mb-4" />
          <CardTitle className="text-lg mb-2">No hospitals yet</CardTitle>
          <CardDescription className="mb-4">
            Get started by creating your first hospital.
          </CardDescription>
          <Button onClick={() => onEdit({} as Hospital)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Hospital
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>All Hospitals</CardTitle>
            <CardDescription>{hospitals.length} total hospitals</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHospitals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    No hospitals found matching your search
                  </TableCell>
                </TableRow>
              ) : (
                filteredHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {hospital.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hospital.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900">
                          {hospital.contact_number || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hospital.email || 'No email'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {hospital.admin?.email || 'Not assigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={hospital.status === 'ACTIVE' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        {hospital.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(hospital)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/super-admin/invitations?hospital=${hospital.id}`}>
                            <Mail className="h-4 w-4 mr-1" />
                            Invite
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}