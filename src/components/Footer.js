import React, { useState, useEffect } from "react";

const Footer = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;

      setIsAtBottom(isBottom);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer className={isAtBottom ? "sticky-footer" : ""}>
      <p>&copy; 2024 Your Cinema App. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
