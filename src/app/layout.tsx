import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VASPTrace · Investigation Prototype",
  description: "A synthetic fund-flow investigation prototype for VASP endpoint attribution.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
