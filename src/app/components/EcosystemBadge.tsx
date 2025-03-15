import React from "react";
import Image from "next/image";

type EcosystemBadgeProps = {
  name: string;
  logoSrc: string;
};

const EcosystemBadge: React.FC<EcosystemBadgeProps> = ({ name, logoSrc }) => (
  <div
    className="
      flex items-center gap-3
      px-6 py-3 
      rounded-full
      bg-white dark:bg-zinc-800
      shadow
      min-w-[160px]
      justify-center
      hover:scale-105
      transition-transform 
      duration-300
    "
  >
    <Image
      src={logoSrc}
      alt={`${name} Logo`}
      width={32}  // bigger icon
      height={32}
      className="rounded-md"
    />
    <span className="text-base font-semibold">{name}</span>
  </div>
);

export default EcosystemBadge;