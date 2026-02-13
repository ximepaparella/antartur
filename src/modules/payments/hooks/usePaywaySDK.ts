/**
 * Hook para cargar e inicializar el SDK de JavaScript de Payway/Decidir
 * y crear tokens de tarjeta de forma segura en el cliente.
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface DecidirTokenResponse {
  id: string;
  status: "valid" | "invalid";
  bin?: string;
  last_four_digits?: string;
  error?: {
    reason?: { description?: string; additional_description?: string };
  };
}

interface DecidirSDK {
  init: (publicKey: string) => void;
  createToken: (
    formOrSelector: HTMLFormElement | string,
    callback: (response: DecidirTokenResponse | number) => void
  ) => void;
}

declare global {
  interface Window {
    Decidir?: {
      init?: (publicKey: string) => void;
      createToken?: DecidirSDK["createToken"];
    };
  }
}

export interface UsePaywaySDKReturn {
  isSDKLoaded: boolean;
  isSDKLoading: boolean;
  sdkError: string | null;
  createToken: (
    cardData: {
      cardNumber: string;
      expirationMonth: string;
      expirationYear: string;
      securityCode: string;
      cardHolderName: string;
    },
    formElement: HTMLFormElement
  ) => Promise<{ token: string; bin: string; lastFourDigits: string }>;
}

export function usePaywaySDK(): UsePaywaySDKReturn {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isSDKLoading, setIsSDKLoading] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const sdkRef = useRef<DecidirSDK | null>(null);
  const publicKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let scriptElement: HTMLScriptElement | null = null;
    let abortController: AbortController | null = null;

    const safeSetLoaded = (v: boolean) => {
      if (isMounted) setIsSDKLoaded(v);
    };
    const safeSetLoading = (v: boolean) => {
      if (isMounted) setIsSDKLoading(v);
    };
    const safeSetError = (v: string | null) => {
      if (isMounted) setSdkError(v);
    };

    if (typeof window === "undefined" || typeof document === "undefined") {
      safeSetError("Este hook solo funciona en el navegador.");
      return () => {};
    }

    safeSetLoading(true);
    safeSetError(null);
    abortController = new AbortController();

    fetch("/api/config/payway", { signal: abortController.signal })
      .then((res) => res.json())
      .then((data: { publicKey?: string | null; environment?: string; error?: string }) => {
        if (!isMounted) return;
        const publicKey = data.publicKey ?? process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
        const environment = data.environment ?? process.env.NEXT_PUBLIC_PAYWAY_ENVIRONMENT ?? "sandbox";

        if (!publicKey || publicKey.trim() === "") {
          safeSetError("Payway Public Key no configurada. Por favor, contacte al soporte.");
          safeSetLoading(false);
          return;
        }

        publicKeyRef.current = publicKey;

        if (window.Decidir && typeof window.Decidir.init === "function") {
          sdkRef.current = window.Decidir as unknown as DecidirSDK;
          sdkRef.current.init(publicKey);
          safeSetLoaded(true);
          safeSetLoading(false);
          return;
        }

        const sdkUrl =
          environment === "production"
            ? "https://live.decidir.com/static/v2.5/decidir.js"
            : "https://developers.decidir.com/static/v2.5/decidir.js";

        const key = publicKey;
        function tryInitDecidir(): boolean {
          const D = window.Decidir;
          if (!D) return false;
          if (typeof D.init === "function" && typeof D.createToken === "function") {
            sdkRef.current = D as unknown as DecidirSDK;
            sdkRef.current.init(key);
            return true;
          }
          if (typeof D === "function") {
            try {
              const instance = new (D as unknown as new (key: string) => DecidirSDK)(key);
              if (typeof instance?.createToken === "function") {
                sdkRef.current = {
                  init: () => {},
                  createToken: instance.createToken.bind(instance),
                };
                return true;
              }
            } catch {
              // ignore
            }
          }
          return false;
        }

        const existingScripts = document.querySelectorAll('script[src*="decidir.js"]');
        if (existingScripts.length > 0) {
          const maxAttempts = 15;
          const intervalMs = 300;
          let attempts = 0;
          const check = () => {
            if (!isMounted) return;
            if (tryInitDecidir()) {
              safeSetLoaded(true);
              safeSetLoading(false);
              return;
            }
            attempts += 1;
            if (attempts >= maxAttempts) {
              safeSetError("El SDK de Payway no se cargó correctamente. Por favor, recargue la página.");
              safeSetLoading(false);
            } else {
              timeoutIds.push(setTimeout(check, intervalMs));
            }
          };
          timeoutIds.push(setTimeout(check, 200));
          return;
        }

        const script = document.createElement("script");
        script.src = sdkUrl;
        script.async = false;
        script.id = "decidir-sdk-script";
        scriptElement = script;

        script.onload = () => {
          const maxAttempts = 15;
          const intervalMs = 300;
          let attempts = 0;

          const check = () => {
            if (!isMounted) return;
            if (tryInitDecidir()) {
              safeSetLoaded(true);
              safeSetLoading(false);
              return;
            }
            attempts += 1;
            if (attempts >= maxAttempts) {
              safeSetError("El SDK de Payway no se cargó correctamente. Por favor, recargue la página.");
              safeSetLoading(false);
              return;
            }
            const tid = setTimeout(check, intervalMs);
            timeoutIds.push(tid);
          };

          const tid = setTimeout(check, 150);
          timeoutIds.push(tid);
        };

        script.onerror = () => {
          safeSetError(
            `Error al cargar el SDK de Payway desde ${sdkUrl}. Verifique su conexión o contacte al soporte.`
          );
          safeSetLoading(false);
        };

        document.head.appendChild(script);
      })
      .catch((err) => {
        if (!isMounted || err?.name === "AbortError") return;
        safeSetError("Payway Public Key no configurada. Por favor, contacte al soporte.");
        safeSetLoading(false);
      });

    return () => {
      isMounted = false;
      abortController?.abort();
      timeoutIds.forEach((id) => clearTimeout(id));
      if (scriptElement) {
        scriptElement.onload = null;
        scriptElement.onerror = null;
        if (scriptElement.parentNode) scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  const createToken = useCallback(
    async (
      cardData: {
        cardNumber: string;
        expirationMonth: string;
        expirationYear: string;
        securityCode: string;
        cardHolderName: string;
      },
      formElement: HTMLFormElement
    ): Promise<{ token: string; bin: string; lastFourDigits: string }> => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("createToken solo funciona en el navegador");
      }
      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        throw new Error("Se debe pasar el elemento del formulario de tarjeta");
      }

      return new Promise((resolve, reject) => {
        if (!sdkRef.current || !publicKeyRef.current) {
          reject(new Error("El SDK de Payway no está cargado"));
          return;
        }
        if (typeof sdkRef.current.init !== "function" || typeof sdkRef.current.createToken !== "function") {
          reject(new Error("El SDK de Payway no está correctamente inicializado"));
          return;
        }

        try {
          sdkRef.current.init(publicKeyRef.current);
        } catch {
          reject(new Error("Error al inicializar el SDK de Payway"));
          return;
        }

        try {
          sdkRef.current.createToken(formElement, (response: DecidirTokenResponse | number) => {
            try {
              const isValidObject =
                response &&
                typeof response === "object" &&
                "status" in response &&
                response.status === "valid" &&
                typeof (response as DecidirTokenResponse).id === "string";

              if (isValidObject) {
                const res = response as DecidirTokenResponse;
                resolve({
                  token: res.id,
                  bin: res.bin ?? cardData.cardNumber.replace(/\s/g, "").slice(0, 6),
                  lastFourDigits:
                    res.last_four_digits ?? cardData.cardNumber.replace(/\s/g, "").slice(-4),
                });
                return;
              }

              const resObj =
                response && typeof response === "object" ? (response as DecidirTokenResponse) : null;
              const errorMessage =
                resObj?.error?.reason?.additional_description ||
                resObj?.error?.reason?.description ||
                (typeof response === "number"
                  ? `Error al tokenizar la tarjeta (código ${response}). Verificá la Public Key y el ambiente (sandbox/producción).`
                  : "Error al tokenizar la tarjeta.");
              reject(new Error(errorMessage));
            } catch (e) {
              reject(e instanceof Error ? e : new Error("Error inesperado al procesar la respuesta del SDK"));
            }
          });
        } catch (e) {
          reject(e instanceof Error ? e : new Error("Error al comunicarse con el SDK de Payway"));
        }
      });
    },
    [isSDKLoaded]
  );

  return {
    isSDKLoaded,
    isSDKLoading,
    sdkError,
    createToken,
  };
}
