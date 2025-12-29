import Link from "next/link";
import { Button } from "@/components/ui/button";
import messages from "@/message/messages_temp.json";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-serif text-xl font-semibold text-primary">
            {messages.nav.title}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/manage"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {messages.nav.links.manage}
          </Link>
          <Button asChild size="sm">
            <Link href="/booking">{messages.nav.links.booking}</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
