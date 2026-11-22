import { AnimatePresence, motion } from 'framer-motion'
import { useId, useState, type FormEvent } from 'react'
import { EASE } from '../../lib/gsap'
import { MagneticButton } from '../ui/Magnetic'
import { SectionLabel } from '../ui/SectionLabel'
import { SplitText } from '../ui/SplitText'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState(false)
  const [sent, setSent] = useState(false)
  const id = useId()
  const valid = /^\S+@\S+\.\S+$/.test(email)
  const floated = focused || email.length > 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (valid) setSent(true)
  }

  return (
    <section className="relative overflow-hidden bg-paper py-28 md:py-44">
      <div className="gutter">
        <SectionLabel index="07" title="Newsletter" />
        <h2 className="display mt-10 text-[clamp(3.4rem,11vw,12rem)] leading-[0.82]">
          <SplitText text="Stay on" className="block" />
          <SplitText text="the clock." className="block" italicWords={['clock.']} delay={0.15} />
        </h2>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          <p className="max-w-sm text-sm leading-relaxed text-charcoal/70 md:col-span-4">
            One letter per collection. Early access, the story behind each accent, and nothing you’d want to unsubscribe from.
          </p>

          <div className="md:col-span-7 md:col-start-6">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.p
                  key="done"
                  className="display text-[clamp(2rem,4vw,3.6rem)] leading-[1]"
                  initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1, ease: EASE }}
                >
                  You’re on the list. <span className="italic text-accent">See you at 09:00.</span>
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="flex flex-col gap-6 sm:flex-row sm:items-end"
                  noValidate
                >
                  <div className="relative flex-1">
                    <label
                      htmlFor={id}
                      className={`pointer-events-none absolute left-0 origin-left transition-all duration-500 ease-lux ${
                        floated ? 'eyebrow -top-5 text-charcoal/60' : 'display top-2 text-3xl text-charcoal/40 md:text-4xl'
                      }`}
                    >
                      Your email address
                    </label>
                    <input
                      id={id}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      autoComplete="email"
                      className="display w-full bg-transparent pt-2 pb-3 text-3xl outline-none md:text-4xl"
                    />
                    <span className="absolute inset-x-0 bottom-0 h-px bg-ink/20" />
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent transition-transform duration-700 ease-lux ${
                        focused ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </div>
                  <MagneticButton type="submit" variant={valid ? 'accent' : 'dark'} size="lg">
                    Subscribe
                  </MagneticButton>
                </motion.form>
              )}
            </AnimatePresence>
            <p className="mt-6 text-[0.7rem] text-charcoal/50">By subscribing you agree to our privacy policy. No spam, ever.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
