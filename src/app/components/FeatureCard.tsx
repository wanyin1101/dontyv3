import React from "react";

type FeatureCardProps = {
  title: string;
  description: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => (
  <div className="p-8 bg-white dark:bg-zinc-800 rounded shadow min-w-[260px]">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm">{description}</p>
  </div>
);

export default FeatureCard;