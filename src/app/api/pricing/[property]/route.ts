import { NextResponse } from "next/server";
import { getPricingForProperty } from "@/lib/pricing";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({
      baseRate: pricing.baseRate,
      cleaningFee: pricing.cleaningFee,
      weeklyDiscount: pricing.weeklyDiscount,
      totRate: pricing.totRate ?? 12,
      cancellationPolicy: pricing.cancellationPolicy ?? "",
      securityDepositPolicy: pricing.securityDepositPolicy ?? "",
      rentalAgreementUrl: pricing.rentalAgreementUrl ?? "",
      rentalAgreementName: pricing.rentalAgreementName ?? "",
    });
  } catch (error) {
    console.error("Error reading pricing:", error);
    return NextResponse.json({ error: "Failed to read pricing" }, { status: 500 });
  }
}
