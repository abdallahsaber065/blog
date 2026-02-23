import Link from "next/link"

const Logo = () => {
  return (
    <Link href="/" className="flex items-center text-dark dark:text-light">
      <span className="text-white font-display font-bold tracking-tight text-lg xs:text-2xl ml-2">Dev <span className="text-gold">Trend</span></span>
    </Link>
  )
}

export default Logo