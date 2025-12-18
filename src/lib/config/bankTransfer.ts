/**
 * Configuración de transferencia bancaria - valores por defecto
 * Los valores reales se almacenan en la base de datos y son editables desde el dashboard
 */

interface BankTransferConfig {
  accountName: string;
  accountNumber: string;
  bank: string;
  cuit: string;
  cbu: string;
  alias: string;
}

/**
 * Obtiene valores por defecto para la configuración de transferencia bancaria
 * Estos valores se usan solo cuando se crea el registro inicial en la BD
 * Los valores reales se configuran desde el dashboard de administración
 */
export function getBankTransferDefaultConfig(): BankTransferConfig {
  // Valores por defecto vacíos - el admin debe configurarlos desde el dashboard
  // Si hay variables de entorno, se pueden usar como valores iniciales (opcional)
  return {
    accountName: process.env.BANK_TRANSFER_ACCOUNT_NAME || "",
    accountNumber: process.env.BANK_TRANSFER_ACCOUNT_NUMBER || "",
    bank: process.env.BANK_TRANSFER_BANK || "",
    cuit: process.env.BANK_TRANSFER_CUIT || "",
    cbu: process.env.BANK_TRANSFER_CBU || "",
    alias: process.env.BANK_TRANSFER_ALIAS || "",
  };
}

