import { Link } from "react-router-dom";
import { Globe, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Horizn</span>
            </div>
            <p className="text-sm opacity-70 max-w-sm">
              Empowering students to achieve their study abroad dreams with expert guidance, resources, and a global community.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider opacity-50">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link to="/resources" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Resource Hub</Link>
              <Link to="/community" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Community</Link>
              <Link to="/your-space" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Your Space</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider opacity-50">Company</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-sm opacity-70 hover:opacity-100 transition-opacity">About Us</Link>
              <Link to="/about#faq" className="text-sm opacity-70 hover:opacity-100 transition-opacity">FAQ</Link>
              <Link to="/privacy" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link to="/about#terms" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Terms of Use</Link>
              <a href="mailto:abraham.loorig@imageofafrica.org" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contact Us</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-50">© {new Date().getFullYear()} Horizn by Global Study Hub. All rights reserved.</p>
          <p className="text-xs opacity-50 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-accent" /> for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
