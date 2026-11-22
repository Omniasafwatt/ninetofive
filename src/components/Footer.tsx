import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { instagramDM, instagramProfile, SITE } from '../data/site'
import { InstagramIcon } from './Icons'
import { Logo, LogoPattern } from './Logo'

export function Footer() {
  const { collections } = useContent()
  return (
    <footer className="relative overflow-hidden bg-maroon text-white">
      <LogoPattern className="-right-[12%] -bottom-[30%] h-[120%] w-[70%] text-red/70" />
      <div className="gutter relative grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <Logo className="h-14 w-auto text-white" />
          <p className="display mt-8 text-xl md:text-2xl">
            Good style
            <br />
            works overtime
          </p>
          <span className="rule mt-5 bg-white!" />
          <a href={instagramDM()} target="_blank" rel="noreferrer" className="btn btn-white mt-8">
            <InstagramIcon /> Order on Instagram
          </a>
        </div>
        <div>
          <p className="eyebrow text-white/55">Your day</p>
          <ul className="mt-5 space-y-3 text-sm">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop?moment=${c.slug}`} className="link">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-white/55">Nine to Five</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link to="/shop" className="link">Shop all</Link></li>
            <li><Link to="/#how-to-order" className="link">How to order</Link></li>
            <li><Link to="/about" className="link">About us</Link></li>
            <li>
              <a href={instagramProfile()} target="_blank" rel="noreferrer" className="link inline-flex items-center gap-2">
                <InstagramIcon className="size-3.5" /> @{SITE.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="gutter relative flex flex-wrap items-center justify-between gap-3 border-t border-white/15 py-6 text-[0.68rem] tracking-[0.2em] text-white/55 uppercase">
        <span>© {new Date().getFullYear()} Nine to Five</span>
        <span>Orders via Instagram DM</span>
      </div>
    </footer>
  )
}
