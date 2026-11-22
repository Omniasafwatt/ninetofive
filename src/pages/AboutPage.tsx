import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowIcon, InstagramIcon } from '../components/Icons'
import { Img } from '../components/Img'
import { Logo, LogoPattern } from '../components/Logo'
import { Reveal } from '../components/Reveal'
import { instagramDM } from '../data/site'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About — Nine to Five'
  }, [])
  return (
    <>
      <section className="gutter pt-20 md:pt-24">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-fog md:rounded-[3rem] lg:grid-cols-2">
          <LogoPattern className="-top-[10%] -left-[20%] h-[120%] w-[90%] text-[#e3e2e2]" />
          <div className="relative flex flex-col justify-center p-8 py-16 sm:p-14 lg:p-20">
            <Logo className="h-12 w-auto self-start text-red" />
            <h1 className="display mt-10 text-[clamp(2rem,4.4vw,3.6rem)] text-charcoal">
              Dressed for
              <br />
              the whole day
            </h1>
            <span className="rule mt-7" />
            <p className="mt-7 max-w-md text-base leading-relaxed text-charcoal/85">
              Nine to Five is a casual clothing brand for girls who are always on the move — at work, at uni, running errands or out for the whole day.
            </p>
          </div>
          <div className="relative p-6 pt-0 sm:p-10 lg:pt-10">
            <Img image="portraitWoman" alt="Nine to Five" className="aspect-[4/5] h-full rounded-[1.75rem] lg:aspect-auto lg:min-h-[34rem]" sizes="(min-width: 1024px) 45vw, 100vw" priority />
          </div>
        </div>
      </section>

      <section className="gutter py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="eyebrow text-red">The idea</p>
            <p className="mt-5 text-lg leading-relaxed text-charcoal md:text-xl">
              Your day doesn’t stop at five — and your clothes shouldn’t give up either. We make pieces that are comfortable enough to live in and sharp enough to feel confident in, from the first coffee to the last stop.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow text-red">The look</p>
            <p className="mt-5 text-lg leading-relaxed text-charcoal md:text-xl">
              Clean, easy and a little different. Not loud, not basic — just the right details, so the outfit looks put-together without trying too hard.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="gutter pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-red px-7 py-16 text-center text-white md:rounded-[3rem] md:py-24">
          <LogoPattern className="-top-[30%] left-[-10%] h-[160%] w-[120%] text-maroon" />
          <Reveal className="relative flex flex-col items-center">
            <p className="display text-[clamp(1.6rem,3.6vw,2.8rem)]">Good style works overtime</p>
            <span className="rule mt-6 w-28 bg-white!" />
            <p className="mt-6 max-w-md text-white/85">Orders, sizes, questions — we answer everything on Instagram.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href={instagramDM()} target="_blank" rel="noreferrer" className="btn btn-white">
                <InstagramIcon /> Message us
              </a>
              <Link to="/shop" className="btn btn-ghost-light">
                Shop now <ArrowIcon />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
