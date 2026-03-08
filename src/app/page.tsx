'use client'

import TickerBar from '@/components/layout/TickerBar'
import HeroSection from '@/components/sections/HeroSection'
import MarqueeStrip from '@/components/sections/MarqueeStrip'
import TaskFeedSection from '@/components/sections/TaskFeedSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import ReputationSection from '@/components/sections/ReputationSection'
import Footer from '@/components/layout/Footer'
import ReceiptModal from '@/components/ui/ReceiptModal'
import TaskModal from '@/components/ui/TaskModal'
import { useApp } from '@/lib/store'

export default function Home() {
  const { activeTask } = useApp()

  return (
    <>
      {/* <TickerBar /> */}
      <main className="pt-16">
        <HeroSection />
        <MarqueeStrip />
        <TaskFeedSection />
        <HowItWorksSection />
        <ReputationSection />
      </main>
      <Footer />
      {activeTask && <TaskModal task={activeTask} />}
      <ReceiptModal />
    </>
  )
}
