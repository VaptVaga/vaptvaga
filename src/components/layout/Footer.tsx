import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isCompanyPage = location.pathname === '/empresas';

  const handleAnchorClick = (e: React.MouseEvent, anchorId: string) => {
    e.preventDefault();
    const element = document.getElementById(anchorId);

    if (element && (location.pathname === '/' || location.pathname === '/empresas')) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `/#${anchorId}`);
    } else {
      // Navigate to home with the hash if not on landing page
      window.location.href = `/#${anchorId}`;
    }
  };

  return (
    <footer className="bg-surface-container-low w-full rounded-t-[3rem] mt-20">
      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="text-xl font-black text-on-surface mb-6">VaptVaga</div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Revolucionamos o trabalho temporário no comércio físico. O VaptVaga liga quem precisa de um freela urgente a quem procura dinheiro extra, de forma rápida, segura e sem complicações.
          </p>
        </div>
        <div>
          <h5 className="font-bold text-on-surface mb-6">Plataforma</h5>
          <ul className="space-y-4 text-sm">
            <li>
              <a
                href="/#como-funciona"
                onClick={(e) => handleAnchorClick(e, 'como-funciona')}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Como Funciona
              </a>
            </li>
            <li>
              <a
                href="/#vagas"
                onClick={(e) => handleAnchorClick(e, 'vagas')}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Vagas Disponíveis
              </a>
            </li>
            <li>
              <Link
                to={isCompanyPage ? "/" : "/empresas"}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                {isCompanyPage ? "Para Freelancers" : "Para Empresas"}
              </Link>
            </li>
            <li>
              <a
                href="/#planos"
                onClick={(e) => handleAnchorClick(e, 'planos')}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Planos
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-on-surface mb-6">Suporte</h5>
          <ul className="space-y-4 text-sm">
            <li><Link to="/faq" className="text-on-surface-variant hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link to="/contato" className="text-on-surface-variant hover:text-primary transition-colors">Contato</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-on-surface mb-6">Legal</h5>
          <ul className="space-y-4 text-sm">
            <li><Link to="/termos" className="text-on-surface-variant hover:text-primary transition-colors">Termos de Uso</Link></li>
            <li><Link to="/privacidade" className="text-on-surface-variant hover:text-primary transition-colors">Privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-on-surface-variant">© 2024 VaptVaga.</p>
        <div className="flex gap-6">
          <a href="https://www.instagram.com/vaptvaga" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors">
            <Instagram size={20} />
          </a>
          <a href="https://www.tiktok.com/@vaptvagaoficial" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
            </svg>
          </a>
          <a href="https://www.youtube.com/@VaptVaga" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors">
            <Youtube size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};
