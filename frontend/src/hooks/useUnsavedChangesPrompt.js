import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useUnsavedChangesPrompt(hasChanges) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasChanges) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const goTo = (path) => {
    if (!hasChanges || window.confirm("Estás saliendo sin guardar, se perderán los cambios. ¿Continuar?")) {
      navigate(path);
      window.location.reload();
    }
  };

  return goTo;
}
