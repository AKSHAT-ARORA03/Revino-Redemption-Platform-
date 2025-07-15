import { HeroSection } from "@/components/homepage/hero-section"
import { FeaturedVouchers } from "@/components/homepage/featured-vouchers"
import { VoucherShowcase } from "@/components/homepage/voucher-showcase"
import { StatsSection } from "@/components/homepage/stats-section"
import { CTASection } from "@/components/homepage/cta-section"
import { getVouchers } from "@/lib/data"

export default async function HomePage() {
  const vouchers = await getVouchers()
  const activeVouchers = vouchers.filter((v) => v.isActive)
  const featuredVouchers = activeVouchers.filter((v) => v.featured)

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedVouchers vouchers={featuredVouchers} />
      <VoucherShowcase vouchers={activeVouchers} />
      <StatsSection />
      <CTASection />
    </div>
  )
}
