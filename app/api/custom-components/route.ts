import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organization_id");

  if (!organizationId) {
    return NextResponse.json(
      { error: "organization_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("custom_components")
    .select("*, profiles:created_by(full_name, avatar_url)")
    .eq("organization_id", organizationId)
    .order("category")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    organization_id,
    name,
    description,
    category,
    icon,
    color,
    provider,
    default_config,
    connection_rules,
  } = body;

  if (!organization_id || !name) {
    return NextResponse.json(
      { error: "organization_id and name are required" },
      { status: 400 }
    );
  }

  // Validate name format
  const namePattern = /^[a-zA-Z0-9][a-zA-Z0-9\s\-_]{0,62}[a-zA-Z0-9]$/;
  if (name.length < 2 || !namePattern.test(name)) {
    return NextResponse.json(
      {
        error:
          "Name must be 2-64 characters, start and end with alphanumeric, and contain only letters, numbers, spaces, hyphens, and underscores",
      },
      { status: 400 }
    );
  }

  // Validate color format
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return NextResponse.json(
      { error: "Color must be a valid hex color (e.g., #6366f1)" },
      { status: 400 }
    );
  }

  // Validate category
  const validCategories = [
    "custom",
    "compute",
    "storage",
    "database",
    "networking",
    "security",
    "monitoring",
    "messaging",
    "container",
    "serverless",
    "ai-ml",
    "devops",
    "other",
  ];
  if (category && !validCategories.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
      { status: 400 }
    );
  }

  // Check membership role
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organization_id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Only organization owners and admins can create components" },
      { status: 403 }
    );
  }

  // Limit per org
  const { count } = await supabase
    .from("custom_components")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organization_id);

  if (count !== null && count >= 100) {
    return NextResponse.json(
      { error: "Maximum 100 custom components per organization" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("custom_components")
    .insert({
      organization_id,
      created_by: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      category: category || "custom",
      icon: icon || "box",
      color: color || "#6366f1",
      provider: provider || "custom",
      default_config: default_config || {},
      connection_rules: connection_rules || [],
    })
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

  return NextResponse.json(data, { status: 201 });
}
