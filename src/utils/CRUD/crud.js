export const handleSave = () => {
    if (!formData.nombres.trim() || !formData.ci.trim()) {
      notify("Nombre y C.I. son obligatorios", "error");
      return;
    }
    if (isNew) {
      const nuevo = { ...formData, id: genId(estudiantes) };
      setEstudiantes((list) => [nuevo, ...list]);
      setSelectedId(nuevo.id);
      setFormData(nuevo);
      setIsNew(false);
      notify("Estudiante registrado correctamente");
    } else {
      setEstudiantes((list) =>
        list.map((s) => (s.id === formData.id ? formData : s)),
      );
      notify("Ficha actualizada correctamente");
    }
  };