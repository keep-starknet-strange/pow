import { useEffect, useState } from 'react';

export const useCalculateTps = () => {
  const [_last10TransactionsTimes, setLast10TransactionsTimes] = useState<number[]>([]);
  const [tps, setTps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLast10TransactionsTimes((prev) => {
        const newTimes = prev.filter((time) => Date.now() - time < 5000);

        if (newTimes.length >= 2) {
          const timeDiff = newTimes[newTimes.length - 1] - newTimes[0];
          const newTps = (newTimes.length - 1) / (timeDiff / 1000);
          setTps(isFinite(newTps) ? newTps : 0);
        } else {
          setTps(0);
        }

        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const recordTransaction = () => {
    setLast10TransactionsTimes((prevTimes) => [...prevTimes, Date.now()].slice(-10));
  };

  return { tps, recordTransaction };
};
