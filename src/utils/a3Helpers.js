export const update = (a3, setA3, path, value) => {
  if (typeof setA3 !== "function") {
    console.error("❌ Error: setA3 no es una función. Revisa la llamada a update().");
    return;
  }

  setA3(prev => {
    const copy = JSON.parse(JSON.stringify(prev));
    let cur = copy;
    for (let i = 0; i < path.length - 1; i++) {
      if (!cur[path[i]]) cur[path[i]] = {}; // crea el nivel si no existe
      cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = value;
    return copy;
  });
};

export const set5W2H = (a3, setA3, key, field, value) => {
  setA3(prev => {
    const copy = JSON.parse(JSON.stringify(prev));
    if (!copy.analisis5W2H[key]) copy.analisis5W2H[key] = { es: "", noEs: "" };
    copy.analisis5W2H[key][field] = value;
    return copy;
  });
};

export const setResumen5W2H = (a3, setA3, value) => {
  setA3(prev => {
    const copy = JSON.parse(JSON.stringify(prev));
    copy.analisis5W2H.resumen = value;
    return copy;
  });
};
