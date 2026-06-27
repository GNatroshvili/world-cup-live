import { NextResponse } from "next/server";
import { getMatchDetail } from "@/lib/worldcup";

export const revalidate = 120;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const detail = await getMatchDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
