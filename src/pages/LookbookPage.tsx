import { useContent } from '../context/ContentContext'
import { useRouteAccent } from '../hooks/useRouteAccent'
import { Lookbook, type Look } from '../components/sections/Lookbook'
import { Img } from '../components/ui/Img'
import { Marquee } from '../components/ui/Marquee'
import { HangingFrame } from '../components/ui/HangingFrame'
import { PageHead } from '../components/ui/PageHead'

const MORE: Look[] = [
  { image: 'milan', caption: 'Piazza, 4 minutes early', time: '09:58', cls: 'col-span-7 md:col-span-5 md:col-start-2', frame: 'aspect-[3/4]', speed: 6 },
  { image: 'suitDark', caption: 'Corridor Trouser, pressed', time: '11:20', cls: 'col-span-5 mt-32 md:col-span-4 md:col-start-8 md:mt-64', frame: 'aspect-[3/4]', speed: 18 },
  { image: 'skylineDusk', caption: 'Rooftop, after the meeting', time: '18:44', cls: 'col-span-12 md:mt-16', frame: 'aspect-[16/10] md:aspect-[21/9]', speed: -6 },
  { image: 'denimWoman', caption: 'Commute Overshirt', time: '20:02', cls: 'col-span-6 md:col-span-3 md:col-start-3 md:mt-24', frame: 'aspect-[3/4]', speed: 20 },
  { image: 'portraitWoman', caption: 'Last train', time: '00:31', cls: 'col-span-6 mt-16 md:col-span-5 md:col-start-7 md:mt-0', frame: 'aspect-[4/5]', speed: 8 },
]

export default function LookbookPage() {
  const { collections } = useContent()
  useRouteAccent(collections[2] ?? collections[0])

  return (
    <>
      <PageHead
        eyebrow="Issue 01 — AW26 — 12 looks"
        title={
          <>
            Look<span className="italic text-accent">book.</span>
          </>
        }
        copy="One day in the city, from the first coffee to the last train. Photographed in natural light, on the streets we actually walk."
        aside={
          <HangingFrame className="mx-auto w-full max-w-[420px] md:ml-auto md:mr-0">
            <Img image="shades" alt="Lookbook cover" className="aspect-[4/5]" sizes="(min-width: 768px) 420px, 100vw" priority />
          </HangingFrame>
        }
      />

      <Lookbook label={false} />

      <div className="bg-ink py-8 text-paper">
        <Marquee className="display text-[clamp(3rem,8vw,7rem)]" items={['Issue 01', 'Built for every hour', 'AW26', 'Same outfit, every hour']} reverse />
      </div>

      <Lookbook label={false} looks={MORE} />
    </>
  )
}
