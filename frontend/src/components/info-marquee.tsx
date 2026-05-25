import { useEffect, useState } from "react";
import { getLocalItems } from "@/lib/mock-data";

const DEFAULT_ITEMS = [
  "Wear a helmet and follow traffic signals near school zones.",
  "Never share OTPs, passwords, or personal details with strangers.",
  "Study in short focused blocks and revise the same day.",
  "Emergency: 112 · Childline: 1098 · Ambulance: 108.",
  "Wash hands, drink clean water, and report fever early.",
  "Use pedestrian crossings and avoid mobile phones while walking on roads.",
  "Say no to drugs and seek help from a trusted teacher.",
  "Save water at school and home. Close taps after use.",
];

export function InfoMarquee() {
  const [items, setItems] = useState(DEFAULT_ITEMS);

  useEffect(() => {
    const load = () => {
      const adminItems = getLocalItems<{ message: string }>("info_bar", []);
      setItems(adminItems.length ? adminItems.map((item) => item.message) : DEFAULT_ITEMS);
    };
    load();
    window.addEventListener("kalvi:info_bar", load);
    return () => window.removeEventListener("kalvi:info_bar", load);
  }, []);

  return (
    <div className="-mt-4 mx-3 mb-4 overflow-hidden rounded-md border border-primary/20 bg-primary py-2 text-primary-foreground shadow-sm">
      <div className="animate-marquee flex gap-10 whitespace-nowrap px-4 text-xs font-semibold">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
