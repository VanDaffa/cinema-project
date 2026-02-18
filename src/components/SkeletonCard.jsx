import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse aspect-[2/3]">
      <div className="w-full h-full bg-gray-700"></div>
    </div>
  );
};

export default SkeletonCard;
