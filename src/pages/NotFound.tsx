import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export default function NotFound() {
  return (
    <section className="gutter grid min-h-[80svh] place-items-center pt-24 text-center">
      <div className="flex flex-col items-center">
        <Logo className="h-14 w-auto text-red" />
        <p className="display mt-10 text-3xl">Off the clock</p>
        <span className="rule mt-6" />
        <p className="mt-6 text-charcoal/75">This page doesn’t exist — but the shop does.</p>
        <Link to="/shop" className="btn btn-red mt-8">
          Go to the shop
        </Link>
      </div>
    </section>
  )
}
