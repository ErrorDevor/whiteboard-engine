import { useEffect, useRef, useState } from "react";

export const useImageLoader = (
  src: string, //--- путь к изображению
  minDelayMs: number, //--- минимальная задержка перед показом изображения (для плавности)
  maxWaitMs: number, //--- максимальное ожидание загрузки, после которого картинка показывается принудительно
  onLoad?: () => void //--- колбэк после успешной загрузки
) => {
  const [loaded, setLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const minTimerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);

  // --- Запускается при успешной загрузке картинки
  const handleNativeLoad = () => {
    setLoaded(true);
  };

  // --- Запускается при ошибке загрузки
  const handleNativeError = () => {
    setShowImage(true);
    clearTimers();
  };

  // --- Очистка таймеров
  const clearTimers = () => {
    if (minTimerRef.current) {
      window.clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      window.clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  };

  // --- Логика минимальной задержки (гарантированное плавное появление)
  useEffect(() => {
    if (!loaded) return;

    minTimerRef.current = window.setTimeout(() => {
      setShowImage(true);
      onLoad?.();
      clearTimers();
    }, minDelayMs);

    return clearTimers;
  }, [loaded, minDelayMs, onLoad]);

  // --- Логика максимального ожидания загрузки
  useEffect(() => {
    maxTimerRef.current = window.setTimeout(() => {
      setShowImage(true);
      clearTimers();
    }, maxWaitMs);

    return clearTimers;
  }, [src, maxWaitMs]);

  return { showImage, handleNativeLoad, handleNativeError };
};
