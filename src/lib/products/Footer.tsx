import Link from "next/link";
import { IconDiscord, IconInstagram } from "@/lib/components/icons";

export default function Footer() {
  return (
    <footer>
      <nav className="flex h-full flex-col items-center justify-center gap-2">
        <ul className="flex flex-col items-center gap-1">
          <section className="flex justify-center gap-2">
            <Link href="https://discord.com/invite/whdfmJbVF7" target="_blank">
              <IconDiscord />
            </Link>
            <Link href="https://www.instagram.com/ssss.sfu/" target="_blank">
              <IconInstagram />
            </Link>
          </section>
          <Link
            className="text-center underline sm:hidden"
            href="https://www.sfussss.org/"
            target="_blank"
          >
            SSSS Website
          </Link>
        </ul>
      </nav>
    </footer>
  );
}
