import { NextResponse } from "next/server"
import { generateCoupon } from "@/lib/data"

export async function GET() {
  try {
    // Generate 10 sample coupons with different values
    const couponValues = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
    const coupons = await Promise.all(
      couponValues.map(async (value) => {
        return await generateCoupon(value)
      })
    )

    return NextResponse.json({
      success: true,
      message: "Sample coupons generated successfully",
      coupons: coupons.map((c) => ({ code: c.code, value: c.value })),
    })
  } catch (error) {
    console.error("❌ Error initializing coupons:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize coupons",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}