import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pointer — Agendamento Autônomo via WhatsApp para Clínicas",
  description:
    "O Pointer qualifica pacientes e agenda consultas no seu calendário em 3 segundos. Sem secretária sobrecarregada. Operação 24/7 com zero alucinação.",
  openGraph: {
    title: "Pointer — Agendamento Autônomo via WhatsApp para Clínicas",
    description:
      "Infraestrutura de agendamento via WhatsApp. 3.2s de latência, 68% dos agendamentos fora do horário, zero alucinação.",
    siteName: "Pointer",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
