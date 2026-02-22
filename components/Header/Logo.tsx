import Image from "next/image"
import Link from "next/link"

const Logo = () => {
  return (
    <Link href="/" className="flex items-center text-dark dark:text-light">

      <div className="hidden sm:block">
        <Image src="/static/images/logo.webp" alt="Dev Trend logo" width={30} height={30} className="hidden dark:block" />

        <Image src="/static/images/logo-dark.webp" alt="Dev Trend logo" width={30} height={30} className="block dark:hidden" />
      </div>

      <span className="text-white font-display font-bold tracking-tight text-lg xs:text-2xl ml-2">Dev <span className="text-gold">Trend</span></span>
    </Link>
  )
}

export default Logo