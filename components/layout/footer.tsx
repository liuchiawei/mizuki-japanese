import Link from "next/link";
import messages from "@/message/messages_temp.json";

export default function Footer() {
  return (
    <footer className="py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <span className="font-serif font-semibold text-primary">
              {messages.footer.title}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/booking"
              className="hover:text-foreground transition-colors"
            >
              {messages.footer.links.booking}
            </Link>
            <Link
              href="/manage"
              className="hover:text-foreground transition-colors"
            >
              {messages.footer.links.manage}
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {messages.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}