import { NextResponse } from 'next/server';
import { currentUser, db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = currentUser(request);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
    }

    const fees = db.prepare('SELECT type, amount, paid, status FROM student_fees WHERE user_id = ?').get(user.id) as any;
    if (!fees) {
      return NextResponse.json({ error: 'Fee details not found.' }, { status: 404 });
    }

    let allocationDetails = null;
    if (fees.type === 'HOSTEL') {
      allocationDetails = db.prepare('SELECT room_no as roomNo, block_name as blockName, warden_name as wardenName FROM student_hostel WHERE user_id = ?').get(user.id);
    } else {
      allocationDetails = db.prepare('SELECT location, pickup_time as pickupTime, drop_time as dropTime FROM student_transport WHERE user_id = ?').get(user.id);
    }

    return NextResponse.json({ fees: { ...fees, details: allocationDetails } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = currentUser(request);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
    }

    const { amount } = await request.json();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Enter a valid payment amount.' }, { status: 400 });
    }

    const payVal = Number(amount);
    const fees = db.prepare('SELECT type, amount, paid FROM student_fees WHERE user_id = ?').get(user.id) as any;
    if (!fees) {
      return NextResponse.json({ error: 'Fee record not found.' }, { status: 404 });
    }

    const newPaid = Math.min(fees.amount, fees.paid + payVal);
    const newStatus = newPaid === fees.amount ? 'PAID' : 'PARTIAL';

    db.prepare('UPDATE student_fees SET paid = ?, status = ? WHERE user_id = ?').run(newPaid, newStatus, user.id);

    let allocationDetails = null;
    if (fees.type === 'HOSTEL') {
      allocationDetails = db.prepare('SELECT room_no as roomNo, block_name as blockName, warden_name as wardenName FROM student_hostel WHERE user_id = ?').get(user.id);
    } else {
      allocationDetails = db.prepare('SELECT location, pickup_time as pickupTime, drop_time as dropTime FROM student_transport WHERE user_id = ?').get(user.id);
    }

    return NextResponse.json({
      success: true,
      fees: {
        type: fees.type,
        amount: fees.amount,
        paid: newPaid,
        status: newStatus,
        details: allocationDetails
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
