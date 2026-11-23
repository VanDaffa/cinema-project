import { useCallback, useEffect, useRef, useState } from 'react';

// Mengelola carousel horizontal: mendeteksi ujung kiri/kanan dan menggeser lewat tombol.
// itemCount dipakai agar batas scroll dihitung ulang saat jumlah item berubah.
export default function useCarouselScroll(itemCount) {
  const ref = useRef(null);
  const [isLeftEnd, setIsLeftEnd] = useState(true);
  const [isRightEnd, setIsRightEnd] = useState(false);

  const update = useCallback(() => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setIsLeftEnd(scrollLeft <= 2);
    setIsRightEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);
  }, []);

  useEffect(() => {
    update();
  }, [itemCount, update]);

  const scrollBy = useCallback((left) => {
    ref.current?.scrollBy({ left, behavior: 'smooth' });
  }, []);

  return { ref, isLeftEnd, isRightEnd, update, scrollBy };
}
