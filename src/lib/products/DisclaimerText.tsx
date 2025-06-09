import Link from "next/link";
export const DisclaimerText = () => (
  <p className="text-xs text-pretty text-neutral-500">
    *By adding to your cart, you are preparing to reserve this item and will pay
    in the future. No financial transactions occur on this site.{" "}
    <Link
      href="/faq"
      className="font-medium text-nowrap underline underline-offset-2 hover:font-bold"
    >
      Learn more here.
    </Link>
  </p>
);
