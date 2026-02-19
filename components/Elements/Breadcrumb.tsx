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
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground py-4 px-5 md:px-10">
            <Link
                href="/"
                className="flex items-center gap-1 hover:text-gold transition-colors duration-150"
                aria-label="Home"
            >
                <Home className="w-3.5 h-3.5" />
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-gold transition-colors duration-150 truncate max-w-[200px]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground font-medium truncate max-w-[300px]">
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;
