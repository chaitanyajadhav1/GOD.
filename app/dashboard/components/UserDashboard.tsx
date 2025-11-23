'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  profile_type: string;
  created_at: string;
  admin_profile?: any;
  doctor_profile?: any;
}

interface FamilyGroup {
  id: string;
  group_name?: string;
  family_members: Array<{
    id: string;
    relationship: string;
    is_primary: boolean;
    profile: Profile;
    user?: {
      mobile_number: string;
    };
  }>;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [activeTab, setActiveTab] = useState<'profiles' | 'family'>('profiles');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const [profilesRes, familyRes] = await Promise.all([
        fetch('/api/profiles', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/family', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (profilesRes.ok) {
        const profilesData = await profilesRes.json();
        setProfiles(profilesData.profiles || []);
      }

      if (familyRes.ok) {
        const familyData = await familyRes.json();
        setFamilyGroups(familyData.familyGroups || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'profiles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Profiles
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'family'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Family
          </button>
        </div>
      </div>

      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Profiles</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {profile.first_name} {profile.last_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 capitalize">
                  {profile.profile_type.toLowerCase()} Profile
                </p>
                
                {profile.doctor_profile && (
                  <div className="text-sm text-gray-500">
                    <p>Specialization: {profile.doctor_profile.specialization}</p>
                    <p>License: {profile.doctor_profile.medical_license_number}</p>
                  </div>
                )}

                {profile.admin_profile && (
                  <div className="text-sm text-gray-500">
                    <p>Department: {profile.admin_profile.department}</p>
                    <p>Employee ID: {profile.admin_profile.employee_id}</p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200">
                    Edit
                  </button>
                  <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200">
                    View Records
                  </button>
                </div>
              </div>
            ))}
          </div>

          {profiles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No profiles found</p>
              <p className="text-gray-400 mt-2">Create your first profile to get started</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'family' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Family Groups</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Create Family Group
            </button>
          </div>

          {familyGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {group.group_name || 'Family Group'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.family_members.map((member) => (
                  <div
                    key={member.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900">
                      {member.profile.first_name} {member.profile.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {member.relationship.toLowerCase()}
                      {member.is_primary && ' • Primary'}
                    </p>
                    {member.user && (
                      <p className="text-sm text-gray-500">
                        {member.user.mobile_number}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {familyGroups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No family groups found</p>
              <p className="text-gray-400 mt-2">Create a family group to manage family members</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}