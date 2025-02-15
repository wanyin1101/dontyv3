import React from "react";

type CollapsibleItem = {
  title: string;
  description: string;
};

type CollapsibleListProps = {
  items: CollapsibleItem[];
};

export function CollapsibleList({ items }: CollapsibleListProps) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <details
          key={idx}
          className="p-4 bg-zinc-800 rounded cursor-pointer transition-colors"
        >
          <summary className="font-semibold text-lg select-none flex items-center justify-between">
            {item.title}
            {/* you can add a plus/minus icon here if you want */}
          </summary>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            {item.description}
          </p>
        </details>
      ))}
    </div>
  );
}