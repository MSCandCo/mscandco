import { useEffect, useRef, useState } from "react";

export default function useWaveSurfer() {
  const WaveSurferConstructor = useRef(null);
  const WaveSurferMultiConstructor = useRef(null);
  const [listen, setListen] = useState(false);

  useEffect(() => {
    importWaveSurfer();
  }, []);

  const importWaveSurfer = async () => {
    WaveSurferConstructor.current = (await import("wavesurfer.js")).default;
    WaveSurferMultiConstructor.current = (await import("wavesurfer-multitrack")).default;
    setListen(!listen);
  };

  return { WaveSurferConstructor: WaveSurferConstructor.current, WaveSurferMultiConstructor: WaveSurferMultiConstructor.current, listen };
}
