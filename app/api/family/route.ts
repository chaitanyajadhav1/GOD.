//auth//family/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/utils';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    const userId = payload.userId;

    const familyGroups = await prisma.familyGroup.findMany({
      where: { primary_user_id: userId },
      include: {
        family_members: {
          include: {
            profile: true,
            user: {
              select: { mobile_number: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ familyGroups });
  } catch (error) {
    console.error('Get family groups error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);
    const userId = payload.userId;

    const body = await request.json();

    // Support two modes:
    // 1) Create group with optional members: { group_name, members: [...] }
    // 2) Add single member to existing group: { group_id, member: {...} }

    if (body.group_id && body.member) {
      const { group_id, member } = body as any;

      const group = await prisma.familyGroup.findFirst({
        where: { id: group_id, primary_user_id: userId },
      });

      if (!group) {
        return NextResponse.json({ error: 'Family group not found' }, { status: 404 });
      }

      let profileId = member.profile_id;
      if (!profileId) {
        const profile = await prisma.profile.create({
          data: {
            user_id: member.user_id || null,
            first_name: member.first_name,
            last_name: member.last_name,
            date_of_birth: member.date_of_birth ? new Date(member.date_of_birth) : null,
            gender: member.gender,
            profile_type: 'PATIENT',
          },
        });
        profileId = profile.id;
      }

      const fm = await prisma.familyMember.create({
        data: {
          family_group_id: group_id,
          user_id: member.user_id || null,
          profile_id: profileId,
          relationship: member.relationship,
          is_primary: false,
        },
      });

      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
      await createAuditLog(
        userId,
        'ADD_FAMILY_MEMBER',
        'FAMILY_MEMBER',
        fm.id,
        { group_id, relationship: member.relationship, profile_id: profileId },
        undefined,
        ipAddress
      );

      return NextResponse.json({ success: true, member: fm }, { status: 201 });
    }

    const { group_name, members = [] } = body as any;

    const familyGroup = await prisma.familyGroup.create({
      data: {
        primary_user_id: userId,
        group_name,
      },
    });

    // Add primary user as first family member
    const primaryProfile = await prisma.profile.findFirst({
      where: { 
        user_id: userId,
        profile_type: 'PATIENT'
      },
    });

    if (primaryProfile) {
      await prisma.familyMember.create({
        data: {
          family_group_id: familyGroup.id,
          user_id: userId,
          profile_id: primaryProfile.id,
          relationship: 'SELF',
          is_primary: true,
        },
      });
    }

    // Add other family members
    for (const member of members) {
      let profileId = member.profile_id;

      // Create profile if not provided
      if (!profileId) {
        const profile = await prisma.profile.create({
          data: {
            user_id: member.user_id || null,
            first_name: member.first_name,
            last_name: member.last_name,
            date_of_birth: member.date_of_birth ? new Date(member.date_of_birth) : null,
            gender: member.gender,
            profile_type: 'PATIENT',
          },
        });
        profileId = profile.id;
      }

      await prisma.familyMember.create({
        data: {
          family_group_id: familyGroup.id,
          user_id: member.user_id || null,
          profile_id: profileId,
          relationship: member.relationship,
          is_primary: false,
        },
      });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await createAuditLog(
      userId,
      'CREATE_FAMILY_GROUP',
      'FAMILY_GROUP',
      familyGroup.id,
      { group_name, member_count: members.length + 1 },
      undefined,
      ipAddress
    );

    return NextResponse.json({ familyGroup });
  } catch (error) {
    console.error('Create family group error:', error);
    return NextResponse.json(
      { error: 'Failed to create family group' },
      { status: 500 }
    );
  }
}