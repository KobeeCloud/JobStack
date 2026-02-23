import { NextRequest, NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-helpers";
import { ApiError } from "@/lib/api-error";
import { uuidSchema } from "@/lib/validation/schemas";
import { z } from "zod";

const VALID_CATEGORIES = [
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
] as const;

const createComponentSchema = z.object({
  organization_id: z.string().uuid(),
  name: z
    .string()
    .min(2)
    .max(64)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9\s\-_]{0,62}[a-zA-Z0-9]$/,
      "Name must start and end with alphanumeric, containing only letters, numbers, spaces, hyphens, underscores"
    ),
  description: z.string().max(500).optional(),
  category: z.enum(VALID_CATEGORIES).default("custom"),
  icon: z.string().max(50).default("box"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color")
    .default("#6366f1"),
  provider: z.string().max(50).default("custom"),
  default_config: z.record(z.unknown()).default({}),
  connection_rules: z.array(z.unknown()).default([]),
});

// GET — list custom components for an organization
export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organization_id");

    if (!organizationId) {
      throw new ApiError(400, "organization_id is required", "MISSING_ORG_ID");
    }

    // Validate UUID format
    uuidSchema.parse(organizationId);

    // MEDIUM-010: Verify user is a member of the organization
    const { data: membership } = await auth.supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", auth.user.id)
      .single();

    if (!membership) {
      throw new ApiError(
        403,
        "You must be a member of this organization",
        "FORBIDDEN"
      );
    }

    const { data, error } = await auth.supabase
      .from("custom_components")
      .select("*, profiles:created_by(full_name, avatar_url)")
      .eq("organization_id", organizationId)
      .order("category")
      .order("name");

    if (error) throw error;

    return NextResponse.json(data);
  },
  { requireAuth: true, method: "GET" }
);

// POST — create a custom component
export const POST = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();
    const parsed = createComponentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.errors[0]?.message ?? "Invalid input",
        "VALIDATION_ERROR"
      );
    }

    const { organization_id, name, ...rest } = parsed.data;

    // Check membership role
    const { data: membership } = await auth.supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organization_id)
      .eq("user_id", auth.user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new ApiError(
        403,
        "Only organization owners and admins can create components",
        "FORBIDDEN"
      );
    }

    // Limit per org
    const { count } = await auth.supabase
      .from("custom_components")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization_id);

    if (count !== null && count >= 100) {
      throw new ApiError(
        400,
        "Maximum 100 custom components per organization",
        "COMPONENT_LIMIT"
      );
    }

    const { data, error } = await auth.supabase
      .from("custom_components")
      .insert({
        organization_id,
        created_by: auth.user.id,
        name: name.trim(),
        description: rest.description?.trim() || null,
        category: rest.category,
        icon: rest.icon,
        color: rest.color,
        provider: rest.provider,
        default_config: rest.default_config,
        connection_rules: rest.connection_rules,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError(
          409,
          "A component with this name already exists in this organization",
          "DUPLICATE_NAME"
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  },
  { requireAuth: true, method: "POST" }
);
