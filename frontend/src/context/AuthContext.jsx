import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // datos del usuario
  const [token, setToken] = useState(null);     // token JWT
  const [modulos, setModulos] = useState([]);   // módulos permitidos
  const [loading, setLoading] = useState(true); // carga inicial

  /* ===========================================================
     🔄 1. Cargar usuario desde LocalStorage una sola vez
     =========================================================== */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);

        setUser(parsed);
        setToken(storedToken);

        if (parsed.modulos && Array.isArray(parsed.modulos)) {
          setModulos(parsed.modulos);
        }
      }
    } catch (error) {
      console.warn("⚠️ Error cargando usuario:", error);
      localStorage.clear();
    }

    setLoading(false);
  }, []);

  /* ===========================================================
     🔐 2. Login: guardar usuario + token + módulos
     =========================================================== */
  const login = (usuario, jwtToken) => {
    const pkg = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      empresa: usuario.empresa,
      empresa_id: usuario.empresa_id,
      modulos: usuario.modulos || [],
    };

    // Guardar en estado
    setUser(pkg);
    setToken(jwtToken);
    setModulos(usuario.modulos || []);

    // Guardar en LocalStorage
    localStorage.setItem("user", JSON.stringify(pkg));
    localStorage.setItem("token", jwtToken);
  };

  /* ===========================================================
     🚪 3. Logout: limpiar app
     =========================================================== */
  const logout = () => {
    setUser(null);
    setToken(null);
    setModulos([]);

    localStorage.clear();
  };

  /* ===========================================================
     ❤️ 4. Exportar valores globales
     =========================================================== */
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        modulos,
        loading,
        login,
        logout,
        isLogged: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
