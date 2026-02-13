/**
 * Hook para cargar e inicializar el SDK de JavaScript de Payway/Decidir
 * 
 * El SDK se carga dinámicamente desde el CDN de Decidir y se inicializa
 * con la API Key Pública para tokenizar datos de tarjeta de forma segura.
 */

import { useState, useEffect, useCallback, useRef } from "react";

// Tipos del SDK de Decidir
// El SDK puede tener diferentes estructuras según la versión
interface DecidirSDK {
  init: (publicKey: string, formSelector?: string) => void;
  createToken: (
    formOrSelector: HTMLFormElement | string,
    callback: (response: DecidirTokenResponse) => void
  ) => void;
}

// Tipo alternativo: si Decidir es una función constructora
type DecidirConstructor = new (publicKey: string) => {
  createToken: (
    cardData: {
      card_number: string;
      card_expiration_month: string;
      card_expiration_year: string;
      security_code: string;
      card_holder_name: string;
    },
    callback: (response: DecidirTokenResponse) => void
  ) => void;
};

interface DecidirTokenResponse {
  id: string;
  status: "valid" | "invalid";
  card_number_length?: number;
  date_created?: string;
  bin?: string;
  last_four_digits?: string;
  security_code_length?: number;
  expiration_month?: number;
  expiration_year?: number;
  cardholder?: {
    identification: {
      type: string;
      number: string;
    };
    name: string;
  };
  error?: {
    type: string;
    reason: {
      id: number;
      description: string;
      additional_description?: string;
    };
  };
}

interface UsePaywaySDKReturn {
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
    /** Elemento del formulario en el DOM. El SDK de Decidir solo acepta el form (usa querySelectorAll), no un objeto. */
    formElement: HTMLFormElement
  ) => Promise<{
    token: string;
    bin: string;
    lastFourDigits: string;
  }>;
}

/**
 * Hook para usar el SDK de Payway/Decidir
 */
export function usePaywaySDK(): UsePaywaySDKReturn {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isSDKLoading, setIsSDKLoading] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const sdkRef = useRef<DecidirSDK | null>(null);
  const publicKeyRef = useRef<string | null>(null);

  // Cargar el SDK dinámicamente
  useEffect(() => {
    // Verificar que estamos en el navegador (SSR safety)
    if (typeof window === "undefined" || typeof document === "undefined") {
      setSdkError("Este hook solo funciona en el navegador.");
      return;
    }
    
    const loadSDK = async () => {
      // Obtener la API Key Pública desde variables de entorno
      const publicKey = process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
      const environment = process.env.NEXT_PUBLIC_PAYWAY_ENVIRONMENT || "sandbox";

      if (!publicKey) {
        const errorMsg = "Payway Public Key no configurada. Por favor, contacte al soporte.";
        setSdkError(errorMsg);
        return;
      }

      publicKeyRef.current = publicKey;

      // Verificar si el SDK ya está cargado
      // El SDK de Decidir puede tener diferentes estructuras según la versión
      // Verificar múltiples formas posibles
      if (window.Decidir) {
        // Verificar si tiene init directamente
        if (typeof window.Decidir.init === "function") {
          sdkRef.current = window.Decidir as unknown as DecidirSDK;
          sdkRef.current.init(publicKey);
          setIsSDKLoaded(true);
          return;
        }
      }

      setIsSDKLoading(true);
      setSdkError(null);

      try {
        // Determinar la URL del SDK según el ambiente
        // URLs según documentación de Decidir/Prisma Medios de Pago
        // NOTA: v2.6.4 puede tener problemas de CORS, usar v2.5 que es más estable
        // Sandbox: https://developers.decidir.com/static/v2.5/decidir.js
        // Producción: https://live.decidir.com/static/v2.5/decidir.js
        const sdkUrl =
          environment === "production"
            ? "https://live.decidir.com/static/v2.5/decidir.js"
            : "https://developers.decidir.com/static/v2.5/decidir.js";

        // Verificar si hay scripts de Decidir existentes (cualquier versión)
        // Verificar que document esté disponible (SSR safety)
        if (typeof document === "undefined") {
          setSdkError("Document no disponible. Este hook solo funciona en el navegador.");
          setIsSDKLoading(false);
          return;
        }
        
        const existingScripts = document.querySelectorAll('script[src*="decidir.js"]');
        if (existingScripts.length > 0) {
          // Verificar si el SDK ya está disponible
          if (window.Decidir) {
            if (typeof window.Decidir.init === "function") {
              sdkRef.current = window.Decidir as unknown as DecidirSDK;
              sdkRef.current.init(publicKey);
              setIsSDKLoaded(true);
              setIsSDKLoading(false);
              return;
            }
          }
          
          // Si hay scripts pero el SDK no está listo, esperar un poco más
          setTimeout(() => {
            if (window.Decidir && typeof window.Decidir.init === "function") {
              sdkRef.current = window.Decidir as unknown as DecidirSDK;
              sdkRef.current.init(publicKey);
              setIsSDKLoaded(true);
              setIsSDKLoading(false);
            }
          }, 1000);
          
          // Si ya hay scripts, no cargar otro (evitar duplicados)
          // Pero si el SDK no está disponible, continuar con la carga
          if (window.Decidir && typeof window.Decidir.init === "function") {
            return; // Ya está cargado, no hacer nada más
          }
        }

        // Cargar el script dinámicamente
        // NOTA: Los scripts <script> no necesitan crossOrigin, y puede causar problemas de CORS
        // Si el servidor no permite CORS, el navegador bloqueará la carga
        const script = document.createElement("script");
        script.src = sdkUrl;
        script.async = true;
        script.defer = true;
        script.id = "decidir-sdk-script";
        // NO usar crossOrigin para scripts - puede causar problemas de CORS

        // Agregar listener antes de agregar al DOM
        script.onload = () => {
          // Dar un pequeño delay para asegurar que el SDK esté completamente inicializado
          setTimeout(() => {
            // Verificar que el SDK se cargó correctamente
            // El SDK puede tener diferentes estructuras
            if (window.Decidir) {
              // Caso 1: window.Decidir tiene método init
              if (typeof window.Decidir.init === "function") {
                sdkRef.current = window.Decidir as unknown as DecidirSDK;
                sdkRef.current.init(publicKey);
                setIsSDKLoaded(true);
                setIsSDKLoading(false);
                return;
              }
              
              // Caso 2: window.Decidir es una función constructora
              if (typeof window.Decidir === "function") {
                try {
                  // Intentar crear una instancia
                  const decidirInstance = new (window.Decidir as DecidirConstructor)(publicKey);
                  if (decidirInstance && typeof decidirInstance.createToken === "function") {
                    // Crear un wrapper para compatibilidad
                    sdkRef.current = {
                      init: () => {}, // No-op, ya se inicializó con el constructor
                      createToken: decidirInstance.createToken.bind(decidirInstance),
                    } as unknown as DecidirSDK;
                    setIsSDKLoaded(true);
                    setIsSDKLoading(false);
                    return;
                  }
                } catch {
                  // Constructor no aplicable, intentar siguiente caso
                }
              }
              
              // Caso 3: Verificar si tiene métodos directamente en window.Decidir
              const decidirObj = window.Decidir as any;
              if (decidirObj && typeof decidirObj.createToken === "function") {
                // Puede que init no sea necesario o sea opcional
                sdkRef.current = {
                  init: (key: string) => {
                    // Intentar inicializar si existe, sino no hacer nada
                    if (typeof decidirObj.init === "function") {
                      decidirObj.init(key);
                    }
                  },
                  createToken: decidirObj.createToken.bind(decidirObj),
                } as unknown as DecidirSDK;
                sdkRef.current.init(publicKey);
                setIsSDKLoaded(true);
                setIsSDKLoading(false);
                return;
              }
            }
            
            const errorMsg = "El SDK de Payway no se cargó correctamente. Por favor, recargue la página.";
            setSdkError(errorMsg);
            setIsSDKLoading(false);
          }, 100);
        };

        script.onerror = () => {
          setSdkError(
            `Error al cargar el SDK de Payway desde ${sdkUrl}. ` +
            `Por favor, verifique su conexión a Internet o contacte al soporte. ` +
            `URL intentada: ${sdkUrl}`
          );
          setIsSDKLoading(false);
        };

        // Agregar el script al DOM
        document.head.appendChild(script);
      } catch (error) {
        setSdkError(
          error instanceof Error
            ? error.message
            : "Error desconocido al cargar el SDK de Payway"
        );
        setIsSDKLoading(false);
      }
    };

    loadSDK();
  }, []);

  // Función para crear un token
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
    ): Promise<{
      token: string;
      bin: string;
      lastFourDigits: string;
    }> => {
      // Verificar que estamos en el navegador
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("createToken solo funciona en el navegador");
      }

      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        throw new Error("Se debe pasar el elemento del formulario de tarjeta");
      }

      return new Promise((resolve, reject) => {
        try {
          if (!isSDKLoaded || !sdkRef.current) {
            reject(new Error("El SDK de Payway no está cargado"));
            return;
          }

          if (!publicKeyRef.current) {
            reject(new Error("API Key Pública no configurada"));
            return;
          }

          // Verificar que el SDK tiene los métodos necesarios
          if (typeof sdkRef.current.init !== "function" || typeof sdkRef.current.createToken !== "function") {
            reject(new Error("El SDK de Payway no está correctamente inicializado"));
            return;
          }

          // Asegurar que el SDK está inicializado
          try {
            sdkRef.current.init(publicKeyRef.current);
          } catch {
            reject(new Error("Error al inicializar el SDK de Payway"));
            return;
          }

          // El SDK de Decidir solo acepta el elemento del formulario: internamente hace
          // form.querySelectorAll(...) para leer los inputs (card_number, security_code, etc.).
          // Si pasamos un objeto, falla con "querySelectorAll is not a function".
          try {
            sdkRef.current.createToken(formElement, (response: DecidirTokenResponse | number) => {
              try {
                // El SDK a veces devuelve el código HTTP (ej. 422) en lugar del objeto de respuesta
                const isValidObject =
                  response &&
                  typeof response === "object" &&
                  "status" in response &&
                  response.status === "valid" &&
                  typeof (response as DecidirTokenResponse).id === "string";

                if (isValidObject) {
                  const res = response as DecidirTokenResponse;
                  const bin = res.bin || cardData.cardNumber.replace(/\s/g, "").slice(0, 6);
                  const lastFourDigits =
                    res.last_four_digits || cardData.cardNumber.replace(/\s/g, "").slice(-4);
                  resolve({
                    token: res.id,
                    bin,
                    lastFourDigits,
                  });
                  return;
                }

                // Respuesta inválida: puede ser objeto con error o código HTTP (ej. 422)
                const resObj = response && typeof response === "object" ? (response as DecidirTokenResponse) : null;
                const errorMessage =
                  resObj?.error?.reason?.additional_description ||
                  resObj?.error?.reason?.description ||
                  (typeof response === "number"
                    ? `Error al tokenizar la tarjeta (código ${response}). Verificá la Public Key de Payway y que estés en el ambiente correcto (sandbox/producción).`
                    : "Error al tokenizar la tarjeta.");
                reject(new Error(errorMessage));
              } catch (callbackError) {
                reject(
                  new Error(
                    callbackError instanceof Error
                      ? callbackError.message
                      : "Error inesperado al procesar la respuesta del SDK"
                  )
                );
              }
            });
            } catch (sdkError) {
              reject(
              new Error(
                sdkError instanceof Error
                  ? sdkError.message
                  : "Error al comunicarse con el SDK de Payway"
              )
            );
          }
        } catch (error) {
          reject(
            new Error(
              error instanceof Error
                ? error.message
                : "Error inesperado al crear el token"
            )
          );
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

// Extender el tipo Window para incluir Decidir
declare global {
  interface Window {
    Decidir?: {
      init: (publicKey: string) => void;
      createToken: (
        cardData: {
          card_number: string;
          card_expiration_month: string;
          card_expiration_year: string;
          security_code: string;
          card_holder_name: string;
        },
        callback: (response: DecidirTokenResponse) => void
      ) => void;
    };
  }
}
