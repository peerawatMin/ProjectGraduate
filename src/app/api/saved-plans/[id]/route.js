import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET - ดึงข้อมูลแผนที่นั่งตาม ID
export async function GET(request, { params }) {
  try {
    console.log('Getting plan with ID:', params.id);
    
    const { data, error } = await supabase
      .from('seating_plans')
      .select('*')
      .eq('seatpid', params.id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: 'ไม่พบแผนที่นั่ง' }, { status: 404 })
    }

    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

// POST - สร้างแผนที่นั่งใหม่
export async function POST(request, { params }) {
  try {
    const body = await request.json()
    console.log('Creating plan with ID:', params.id, 'Data:', body);
    
    // ตรวจสอบว่ามี ID นี้อยู่แล้วหรือไม่
    const { data: existingPlan } = await supabase
      .from('seating_plans')
      .select('seatpid')
      .eq('seatpid', params.id)
      .single()

    if (existingPlan) {
      return Response.json({ error: 'แผนที่นั่งนี้มีอยู่แล้ว' }, { status: 409 })
    }

    // เตรียมข้อมูลสำหรับการ insert
    const insertData = {
      seatpid: params.id,
      plan_name: body.plan_name,
      seating_pattern: body.seating_pattern,
      room_rows: body.room_rows,
      room_cols: body.room_cols,
      arrangement_data: body.arrangement_data,
      user_id: body.user_id,
      // created_at และ updated_at จะถูกสร้างอัตโนมัติโดย Supabase
    }

    const { data, error } = await supabase
      .from('seating_plans')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ 
      message: 'สร้างแผนที่นั่งสำเร็จ', 
      data: data[0] 
    }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'เกิดข้อผิดพลาดในการสร้างแผน' }, { status: 500 })
  }
}

// PUT - อัพเดทแผนที่นั่งทั้งหมด (แทนที่ข้อมูลเดิม)
export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    console.log('Updating plan with ID:', params.id, 'Data:', body);
    
    // เตรียมข้อมูลสำหรับการ update (ไม่รวม seatpid, created_at)
    const updateData = {
      plan_name: body.plan_name,
      seating_pattern: body.seating_pattern,
      room_rows: body.room_rows,
      room_cols: body.room_cols,
      arrangement_data: body.arrangement_data,
      user_id: body.user_id,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('seating_plans')
      .update(updateData)
      .eq('seatpid', params.id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return Response.json({ error: 'ไม่พบแผนที่นั่งที่ต้องการอัพเดท' }, { status: 404 })
    }

    return Response.json({ 
      message: 'อัพเดทแผนที่นั่งสำเร็จ', 
      data: data[0] 
    })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'เกิดข้อผิดพลาดในการอัพเดทแผน' }, { status: 500 })
  }
}

// PATCH - อัพเดทแผนที่นั่งบางส่วน
export async function PATCH(request, { params }) {
  try {
    const body = await request.json()
    console.log('Partially updating plan with ID:', params.id, 'Data:', body);
    
    // เพิ่ม updated_at เมื่อมีการอัพเดท
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('seating_plans')
      .update(updateData)
      .eq('seatpid', params.id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return Response.json({ error: 'ไม่พบแผนที่นั่งที่ต้องการแก้ไข' }, { status: 404 })
    }

    return Response.json({ 
      message: 'แก้ไขแผนที่นั่งสำเร็จ', 
      data: data[0] 
    })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขแผน' }, { status: 500 })
  }
}

// DELETE - ลบแผนที่นั่ง
export async function DELETE(request, { params }) {
  try {
    console.log('Deleting plan with ID:', params.id);
    
    const { error } = await supabase
      .from('seating_plans')
      .delete()
      .eq('seatpid', params.id)

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ message: 'ลบแผนที่นั่งสำเร็จ' })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'เกิดข้อผิดพลาดในการลบแผน' }, { status: 500 })
  }
}