import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Home className="w-4 h-4" />
        Home
      </button>
    </div>
  );
}
