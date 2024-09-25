import InsightRoll from "@/components/About/InsightRoll";


const insights = [
    "20+ Projects Completed",
    "3+ Years of Freelancing",
    "99% Client Satisfaction",
    "20K+ Subscribers",
  ];

import { ReactNode } from 'react';

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full flex flex-col items-center justify-between">
      {/* <InsightRoll insights={insights} /> */}
      {children}
    </main>
  );
}
