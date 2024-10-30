import Image from "next/image"
import Link from "next/link"
import lightLogo from "public/static/images/logo.png"
import darkLogo from "public/static/images/logo-dark.png"

const Logo = () => {
  return (
    <Link href="/" className="flex items-center text-dark dark:text-light">

      <div className="hidden sm:block">
        <Image src={lightLogo} alt="Dev Trend logo" width={30} height={30} className="hidden dark:block" />

        <Image src={darkLogo} alt="Dev Trend logo" width={30} height={30} className="block dark:hidden" />
      </div>

      <span className="font-bold dark:font-semibold text-lg xs:text-2xl ml-2">Dev Trend</span>
    </Link>
  )
}

export default Logo