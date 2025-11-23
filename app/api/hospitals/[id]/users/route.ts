// // app/api/hospitals/[id]/users/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { verifyAccessToken } from '@/lib/auth';
// import { createAuditLog } from '@/lib/utils';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
//     if (!accessToken) {
//       return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//     }

//     const payload = verifyAccessToken(accessToken);
//     const hospitalId = params.id;

//     // Verify user has access to this hospital
//     const hospitalUser = await prisma.hospitalUser.findFirst({
//       where: {
//         hospital_id: hospitalId,
//         user_id: payload.userId,
//         status: 'ACTIVE',
//       },
//       include: {
//         hospital: true
//       }
//     });

//     if (!hospitalUser) {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     const users = await prisma.hospitalUser.findMany({
//       where: { hospital_id: hospitalId },
//       include: {
//         user: {
//           select: {
//             id: true,
//             email: true,
//             mobile_number: true,
//             user_type: true,
//             status: true,
//           }
//         },
//         department: true,
//       },
//       orderBy: { created_at: 'desc' }
//     });

//     return NextResponse.json({
//       success: true,
//       data: users,
//       count: users.length
//     });

//   } catch (error) {
//     console.error('Get hospital users error:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch hospital users' },
//       { status: 500 }
//     );
//   }
// }