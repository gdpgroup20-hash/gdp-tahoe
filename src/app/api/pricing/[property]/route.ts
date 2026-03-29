import { NextResponse } from "next/server";
import { getPricingForProperty } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ property: string }> }
) {
  try {
    const { property } = await params;
    const pricing = await getPricingForProperty(property);
    if (!pricing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    const response = NextResponse.json({
      baseRate: pricing.baseRate,
      cleaningFee: pricing.cleaningFee,
      weeklyDiscount: pricing.weeklyDiscount,
      totRate: pricing.totRate ?? 12,
      cancellationPolicy: pricing.cancellationPolicy ?? "",
      securityDepositPolicy: pricing.securityDepositPolicy ?? "",
      rentalAgreementUrl: pricing.rentalAgreementUrl ?? "",
      rentalAgreementName: pricing.rentalAgreementName ?? "",
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    return response;
  } catch (error) {
    console.error("Error reading pricing:", error);
    return NextResponse.json({ error: "Failed to read pricing" }, { status: 500 });
  }
}
