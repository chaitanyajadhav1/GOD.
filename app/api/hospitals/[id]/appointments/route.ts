// // app/api/hospitals/[hospitalId]/appointments/route.ts

// import { verifyAccessToken } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { hospitalId: string } }
// ) {
//   try {
//     const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
//     if (!accessToken) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const payload = verifyAccessToken(accessToken);

//     // Verify hospital access
//     const hospitalUser = await prisma.hospitalUser.findFirst({
//       where: {
//         hospital_id: params.hospitalId,
//         user_id: payload.userId,
//       },
//     });

//     if (!hospitalUser) {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     const hospitalContext = await getHospitalContext(request);

//     const {
//       patient_id,
//       doctor_user_id,
//       doctor_profile_id,
//       appointment_date,
//       appointment_time,
//       reason,
//     } = await request.json();

//     // Verify patient exists in THIS hospital's database
//     const patient = await hospitalContext.hospitalPrisma.patient.findUnique({
//       where: { id: patient_id },
//     });

//     if (!patient) {
//       return NextResponse.json(
//         { error: 'Patient not found in this hospital' },
//         { status: 404 }
//       );
//     }

//     // Verify doctor exists in MAIN DB and has access to this hospital
//     const doctorAccess = await prisma.hospitalUser.findFirst({
//       where: {
//         hospital_id: params.hospitalId,
//         user_id: doctor_user_id,
//         role: 'DOCTOR',
//       },
//     });

//     if (!doctorAccess) {
//       return NextResponse.json(
//         { error: 'Doctor not found or no access to this hospital' },
//         { status: 404 }
//       );
//     }

//     // Create appointment in HOSPITAL DB
//     const appointment = await hospitalContext.hospitalPrisma.appointment.create({
//       data: {
//         patient_id,
//         doctor_user_id,
//         doctor_profile_id,
//         appointment_date: new Date(appointment_date),
//         appointment_time,
//         reason,
//         status: 'SCHEDULED',
//       },
//     });

//     // Audit log in MAIN DB
//     await prisma.auditLog.create({
//       data: {
//         user_id: payload.userId,
//         hospital_id: params.hospitalId,
//         action_type: 'CREATE_APPOINTMENT',
//         entity_type: 'APPOINTMENT',
//         entity_id: appointment.id,
//         details: {
//           patient_id,
//           doctor_user_id,
//           appointment_date,
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Appointment scheduled successfully',
//       appointment,
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error('Create appointment error:', error);
//     return NextResponse.json(
//       { error: 'Failed to create appointment' },
//       { status: 500 }
//     );
//   }
// }
