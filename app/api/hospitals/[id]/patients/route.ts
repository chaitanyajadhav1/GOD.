// // app/api/hospitals/[hospitalId]/patients/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { verifyAccessToken } from '@/lib/auth';
// import { getHospitalContext } from '@/lib/hospital-context';
// import { prisma } from '@/lib/prisma'; // Main DB

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { hospitalId: string } }
// ) {
//   try {
//     // 1. Verify authentication (MAIN DB)
//     const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
//     if (!accessToken) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const payload = verifyAccessToken(accessToken);

//     // 2. Verify user has access to this hospital (MAIN DB)
//     const hospitalUser = await prisma.hospitalUser.findFirst({
//       where: {
//         hospital_id: params.hospitalId,
//         user_id: payload.userId,
//       },
//     });

//     if (!hospitalUser || !['ADMIN', 'DOCTOR'].includes(hospitalUser.role)) {
//       return NextResponse.json(
//         { error: 'Access denied' },
//         { status: 403 }
//       );
//     }

//     // 3. Get hospital database context
//     const hospitalContext = await getHospitalContext(request);
    
//     if (!hospitalContext) {
//       return NextResponse.json(
//         { error: 'Hospital not found' },
//         { status: 404 }
//       );
//     }

//     // 4. Parse request body
//     const {
//       user_id,
//       profile_id,
//       blood_group,
//       allergies,
//       emergency_contact,
//     } = await request.json();

//     // 5. Validate user and profile exist in MAIN DB
//     const user = await prisma.user.findUnique({
//       where: { id: user_id },
//       include: {
//         profiles: {
//           where: { id: profile_id }
//         }
//       }
//     });

//     if (!user || user.profiles.length === 0) {
//       return NextResponse.json(
//         { error: 'User or profile not found' },
//         { status: 404 }
//       );
//     }

//     // 6. Generate medical record number
//     const recordNumber = await generateMedicalRecordNumber(hospitalContext.hospitalPrisma);

//     // 7. Create patient in HOSPITAL DATABASE
//     const patient = await hospitalContext.hospitalPrisma.patient.create({
//       data: {
//         user_id,
//         profile_id,
//         medical_record_no: recordNumber,
//         blood_group,
//         allergies,
//         emergency_contact,
//         admission_date: new Date(),
//       },
//     });

//     // 8. Create audit log in MAIN DB
//     await prisma.auditLog.create({
//       data: {
//         user_id: payload.userId,
//         hospital_id: params.hospitalId,
//         action_type: 'CREATE_PATIENT',
//         entity_type: 'PATIENT',
//         entity_id: patient.id,
//         details: {
//           medical_record_no: recordNumber,
//           profile_id,
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Patient registered successfully',
//       patient: {
//         id: patient.id,
//         medical_record_no: patient.medical_record_no,
//         user: {
//           id: user.id,
//           mobile_number: user.mobile_number,
//           email: user.email,
//         },
//         profile: user.profiles[0],
//       },
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error('Create patient error:', error);
//     return NextResponse.json(
//       { error: 'Failed to create patient' },
//       { status: 500 }
//     );
//   }
// }

// async function generateMedicalRecordNumber(hospitalPrisma: any): Promise<string> {
//   const count = await hospitalPrisma.patient.count();
//   const year = new Date().getFullYear();
//   return `MR${year}${String(count + 1).padStart(6, '0')}`;
// }



// // app/api/hospitals/[hospitalId]/patients/route.ts

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { hospitalId: string } }
// ) {
//   try {
//     // 1. Verify authentication
//     const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
//     if (!accessToken) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const payload = verifyAccessToken(accessToken);

//     // 2. Verify hospital access (MAIN DB)
//     const hospitalUser = await prisma.hospitalUser.findFirst({
//       where: {
//         hospital_id: params.hospitalId,
//         user_id: payload.userId,
//       },
//     });

//     if (!hospitalUser) {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     // 3. Get hospital context
//     const hospitalContext = await getHospitalContext(request);

//     // 4. Get patients from HOSPITAL DB
//     const patients = await hospitalContext.hospitalPrisma.patient.findMany({
//       take: 50,
//       orderBy: { created_at: 'desc' },
//     });

//     // 5. Enrich with user/profile data from MAIN DB
//     const enrichedPatients = await Promise.all(
//       patients.map(async (patient: any) => {
//         const user = await prisma.user.findUnique({
//           where: { id: patient.user_id },
//           select: {
//             id: true,
//             mobile_number: true,
//             email: true,
//           },
//         });

//         const profile = await prisma.profile.findUnique({
//           where: { id: patient.profile_id },
//           select: {
//             id: true,
//             first_name: true,
//             last_name: true,
//             date_of_birth: true,
//             gender: true,
//           },
//         });

//         return {
//           ...patient,
//           user,
//           profile,
//         };
//       })
//     );

//     return NextResponse.json({
//       success: true,
//       hospital: hospitalContext.hospitalName,
//       patients: enrichedPatients,
//       count: enrichedPatients.length,
//     });

//   } catch (error: any) {
//     console.error('Get patients error:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch patients' },
//       { status: 500 }
//     );
//   }
// }