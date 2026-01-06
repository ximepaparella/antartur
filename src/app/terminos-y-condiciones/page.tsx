import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Términos y Condiciones - Antartur",
  description: "Términos y condiciones de uso de los servicios de Antartur. Políticas de reserva, pago, cancelaciones y responsabilidades.",
  keywords: ["términos y condiciones", "Antartur", "políticas", "reservas", "cancelaciones"],
  openGraph: {
    title: "Términos y Condiciones - Antartur",
    description: "Términos y condiciones de uso de los servicios de Antartur.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Términos y Condiciones - Antartur",
    description: "Términos y condiciones de uso de los servicios de Antartur.",
  },
};

export default function TerminosYCondicionesPage() {
  return (
    <>
      <Hero variant="internal" pageKey="terminos-y-condiciones" />
      <main className="mainContainer">
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>A. Contrato</h2>
            <p>
              La reserva se considerará aceptada y definitiva una vez que Antartur haya recibido el pago correspondiente por parte del Cliente. En ese momento, se establece formalmente el contrato entre Antartur y el Cliente.
            </p>
            <p>
              Al efectuar el pago y proporcionar su información personal, el Cliente declara haber leído, comprendido y aceptado los presentes términos y condiciones.
            </p>
            <p>
              El contrato se celebra entre Antartur y todas las personas incluidas en la reserva. La persona que realiza la reserva afirma contar con la autorización para representar a todos los integrantes del grupo, y garantiza que todos ellos aceptan los términos y condiciones establecidos.
            </p>

            <h3>A.1 Política de menores</h3>
            <p>
              Menores de 1 a 11 años: descuento del 40 %.
            </p>
            <p>
              Menores de 1 año: no son recomendables las excursiones de aventura.
            </p>

            <h3>A.2 Excursiones y declaración de salud, reconocimiento de riesgos y responsabilidades</h3>
            <p>
              Para las excursiones no convencionales, antes de iniciar la actividad se deberá completar y firmar la Declaración de Salud y Reconocimiento de Riesgos y Responsabilidades. Esta declaración es obligatoria para poder realizar la actividad.
            </p>
          </section>

          <section className={styles.section}>
            <h2>B. Pago</h2>
            <p>
              En caso de pre-reserva, el Cliente deberá depositar una seña del 50 % del total a pagar.
            </p>
            <p>
              El saldo restante deberá abonarse, a más tardar, 30 días antes de iniciar el servicio.
            </p>
            <p>
              Si no se efectúa el pago en esa fecha, Antartur podrá considerar la reserva cancelada por el Cliente.
            </p>
            <p>
              Para reservas realizadas con menos de 30 días de anticipación al inicio del servicio, el Cliente deberá abonar el 100 % al momento de contratar.
            </p>
            <p>
              <strong>Formas de pago:</strong>
            </p>
            <ul>
              <li>Depósito/transferencia bancaria</li>
              <li>Efectivo</li>
              <li>Tarjeta de débito/crédito</li>
            </ul>
            <p>
              <strong>Nota:</strong> Todos los costos bancarios y cargos adicionales por pago con tarjeta de crédito serán responsabilidad del Cliente.
            </p>
          </section>

          <section className={styles.section}>
            <h2>C. Cambios y Cancelaciones por parte del Cliente</h2>
            <p>
              Cualquier modificación a la reserva original debe solicitarse por escrito y será responsabilidad del Cliente asumir todos los costos y cargos derivados.
            </p>
            <p>
              Antartur hará sus mejores esfuerzos por atender las solicitudes de cambio, pero no garantiza la disponibilidad de los servicios modificados.
            </p>
            <p>
              El Cliente puede cancelar en cualquier momento, comunicándolo por escrito.
            </p>
            <p>
              Los cargos por cancelación se aplican según la siguiente tabla:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Días antes del inicio del viaje</th>
                    <th>Penalidad por cancelación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>30 días o más</td>
                    <td>20 %</td>
                  </tr>
                  <tr>
                    <td>29–25 días</td>
                    <td>30 %</td>
                  </tr>
                  <tr>
                    <td>24–15 días</td>
                    <td>40 %</td>
                  </tr>
                  <tr>
                    <td>14–9 días</td>
                    <td>60 %</td>
                  </tr>
                  <tr>
                    <td>8 días o menos</td>
                    <td>100 %</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Cancelaciones parciales: las personas restantes pueden generar cargos adicionales (ej. subocupación de vehículos).
            </p>
          </section>

          <section className={styles.section}>
            <h2>D. Cambios y Cancelaciones por parte de Antartur</h2>
            <p>
              Antartur realizará sus máximos esfuerzos por operar según lo acordado, pero el Cliente acepta que el itinerario puede adaptarse por factores climáticos u otras variables ajenas.
            </p>
            <p>
              Antartur podrá cancelar o cambiar servicios en cualquier momento, sustituyéndolos por otros de condiciones y valores similares, sin compensación al Cliente.
            </p>
            <p>
              Si hay un cambio significativo antes de la contratación, se informará al Cliente para su conformidad.
            </p>
            <p>
              Si el cambio significativo ocurre luego de la contratación, el Cliente podrá:
            </p>
            <ul>
              <li>Mantener el servicio modificado.</li>
              <li>Optar por otro servicio.</li>
              <li>Recibir un reembolso total.</li>
            </ul>
            <p>
              Excepciones por fuerza mayor (guerras, desastres naturales, cambios de vuelos, etc.): Antartur no asume responsabilidad ni cargos.
            </p>
          </section>

          <section className={styles.section}>
            <h2>E. Pasaporte, Visa, Seguro médico y Vacunas</h2>
            <p>
              Es responsabilidad del Cliente poseer pasaporte válido, visas correspondientes, seguro médico, vacunas y cualquier medicina preventiva requerida para los servicios contratados.
            </p>
          </section>

          <section className={styles.section}>
            <h2>F. Enfermedades o Discapacidades</h2>
            <p>
              Quien sufra una enfermedad, discapacidad o esté bajo tratamiento médico deberá declarar la verdadera naturaleza de su condición antes de la reserva. De lo contrario, quedará excluido del servicio sin derecho a reembolso.
            </p>
          </section>

          <section className={styles.section}>
            <h2>G. Seguro de Viaje</h2>
            <p>
              Antartur no incluye ningún tipo de seguro en sus precios ni en www.antartur.tur.ar.
            </p>
          </section>

          <section className={styles.section}>
            <h2>H. Reclamos</h2>
            <p>
              Cualquier reclamo debe informarse inmediatamente al guía o representante de Antartur para permitir acciones correctivas a tiempo.
            </p>
            <p>
              Si el Cliente no reclama durante la prestación del servicio, la compensación podrá reducirse o negarse.
            </p>
            <p>
              Reclamos presentados pasados 30 días de la prestación no serán admitidos.
            </p>
            <p>
              La política de reintegros seguirá la establecida por el organizador del evento.
            </p>
          </section>

          <section className={styles.section}>
            <h2>I. Nuestra Responsabilidad</h2>
            <p>
              Antartur actúa como agente de viajes, intermediando entre Cliente y proveedores. Asume la responsabilidad de que los servicios se provean según lo descrito, pero no es responsable de:
            </p>
            <ul>
              <li>Daños o pérdidas causados por negligencia u omisiones de proveedores.</li>
              <li>Desastres naturales u otras causas fuera de su control.</li>
              <li>Cualquier irregularidad en vuelos, transporte u otros servicios contratados.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>J. Términos y Condiciones de la Web</h2>
            <p>
              Los contenidos de este sitio (diseño, textos, imágenes) son propiedad de Antartur o sus licenciatarios. Las leyes de autoría protegen estos materiales; por ello, los usuarios no pueden:
            </p>
            <ul>
              <li>Copiar, reproducir, modificar, usar, republicar, subir, postear, transmitir o distribuir material alguno sin autorización.</li>
              <li>Copiar o mostrar marcas, nombres o logos sin permiso.</li>
              <li>Incluir contenido del sitio en &quot;frames&quot; sin autorización.</li>
            </ul>
            <p>
              Antartur no garantiza que la información sea completa o actualizada. No se responsabiliza por daños derivados del uso del sitio, accesos no autorizados o enlaces a terceros. Queda prohibida la violación de la seguridad del sistema; las infracciones podrán derivar en acciones legales. Antartur puede modificar el contenido web en cualquier momento sin aviso previo.
            </p>
            <p>
              <strong>Marcas Registradas:</strong> El logo y diseño de Antartur son marcas registradas y no pueden copiarse ni usarse sin consentimiento.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

