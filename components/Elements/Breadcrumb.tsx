import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
    return (
        <nav aria-label="Breadcrumb" className="items-center gap-1.5 text-sm py-5 px-5 hidden md:flex w-full mb-2">
            <Link
                href="/"
                className="flex items-center gap-1.5 text-foreground/60 hover:text-gold hover:bg-gold/10 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
                aria-label="Home"
            >
                <Home className="w-4 h-4" />
                <span className="sr-only">Home</span>
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-foreground/30" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-foreground/60 hover:text-gold hover:bg-gold/10 px-2 py-1.5 rounded-lg transition-all duration-200 truncate max-w-[200px] font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground/90 font-semibold px-2 py-1.5 truncate max-w-[300px]">
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;
