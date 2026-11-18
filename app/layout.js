import { Figtree } from 'next/font/google';
import './globals.css';

const font = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'LabClaro | Resultados de laboratorio',
  description: 'Consulta y descarga tus resultados de laboratorio de forma segura.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={font.className}>{children}</body>
    </html>
  );
}
