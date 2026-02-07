import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("custom_components")
    .select("*, profiles:created_by(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Component not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch existing component to check org membership
  const { data: existing } = await supabase
    .from("custom_components")
    .select("organization_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Component not found" },
      { status: 404 }
    );
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", existing.organization_id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Only organization owners and admins can update components" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const allowedFields = [
    "name",
    "description",
    "category",
    "icon",
    "color",
    "provider",
    "default_config",
    "connection_rules",
    "is_shared",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  // Validate name if provided
  if (updates.name) {
    const nameStr = updates.name as string;
    const namePattern = /^[a-zA-Z0-9][a-zA-Z0-9\s\-_]{0,62}[a-zA-Z0-9]$/;
    if (nameStr.length < 2 || !namePattern.test(nameStr)) {
      return NextResponse.json(
        { error: "Invalid component name format" },
        { status: 400 }
      );
    }
    updates.name = nameStr.trim();
  }

  // Validate color if provided
  if (updates.color && !/^#[0-9a-fA-F]{6}$/.test(updates.color as string)) {
    return NextResponse.json(
      { error: "Color must be a valid hex color (e.g., #6366f1)" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("custom_components")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A component with this name already exists in this organization" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch existing component to check org membership
  const { data: existing } = await supabase
    .from("custom_components")
    .select("organization_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Component not found" },
      { status: 404 }
    );
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", existing.organization_id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Only organization owners and admins can delete components" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("custom_components")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
