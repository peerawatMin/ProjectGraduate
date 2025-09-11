/* eslint-disable @typescript-eslint/no-explicit-any */
// Add this POST function to your existing /api/seating-plans/[id]/route.ts file
// alongside your existing GET, PUT, and DELETE functions

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SavedPlan,InsertPlanData  } from "@/types/examTypes";
import { NextResponse } from "next/server";

// POST /api/seating-plans/[id] - Create new seating plan with specific ID
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body: InsertPlanData = await req.json();

    // Validate required fields
    if (!body.plan_name?.trim()) {
      return NextResponse.json({ error: 'plan_name is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const insertData = {
      seatpid: id, // Use the provided ID
      ...body,
      created_at: now,
      updated_at: now,
    };

    console.log('Creating seating plan with data:', insertData);

    const { data, error } = await supabaseAdmin
      .from("seating_plans")
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error creating seating plan:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned after insert');
    }

    console.log('Successfully created seating plan:', data[0]);

    return NextResponse.json({
      message: "สร้างแผนที่นั่งสำเร็จ",
      data: data[0] as SavedPlan,
    }, { status: 201 });

  } catch (err: any) {
    console.error('API error creating seating plan:', err);
    
    // Handle specific database errors
    if (err.code === '23505') { // Unique constraint violation
      return NextResponse.json({ error: 'มีแผนที่นั่งนี้อยู่แล้วในระบบ' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: err.message || 'เกิดข้อผิดพลาดในการสร้างแผนที่นั่ง' 
    }, { status: 500 });
  }
}