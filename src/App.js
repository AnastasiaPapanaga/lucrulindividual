import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const App = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // Căutare
  const [filterCategory, setFilterCategory] = useState(""); // Filtrare după categorie
  const [sortOrder, setSortOrder] = useState("asc"); // Sortare: ascendentă sau descendentă

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:3001/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validate = () => {
    let validationErrors = {};

    // Validare pentru formularul de creare sau actualizare
    if (!formData.name.trim()) {
      validationErrors.name = "Numele este obligatoriu.";
    }

    if (!formData.category.trim()) {
      validationErrors.category = "Categoria este obligatorie.";
    }

    if (!formData.description.trim()) {
      validationErrors.description = "Descrierea este obligatorie.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const validateSearch = (term) => {
    // Validare pentru căutare
    if (term.trim().length < 2) {
      return "Căutarea trebuie să conțină cel puțin 2 caractere.";
    }
    return null;
  };

  const validateId = (id) => {
    if (!id || isNaN(id)) {
      return "ID invalid.";
    }
    return null;
  };

  const createItem = async () => {
    if (!validate()) return;

    try {
      await axios.post("http://localhost:3001/items", formData);
      fetchItems();
      setFormData({ id: "", name: "", category: "", description: "" });
      setErrors({});
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const deleteItem = async (id) => {
    const validationError = validateId(id);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchChange = (e) => {
    const errorMessage = validateSearch(e.target.value);
    setSearchTerm(e.target.value);
    setErrors({
      ...errors,
      search: errorMessage,
    });
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getFilteredAndSortedItems = () => {
    let filteredItems = items;

    // Căutare validată
    if (searchTerm.trim()) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrare după categorie
    if (filterCategory.trim()) {
      filteredItems = filteredItems.filter((item) =>
        item.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Sortare
    filteredItems.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    return filteredItems;
  };

  return (
    <div>
      <h1>CRUD with JSON Backend</h1>
      <p>
        Dezvoltați o interfață pentru aplicația, care să permită interacțiunea cu API-ul backend-ului. 
        Această interfață trebuie să fie intuitivă și ușor de utilizat pentru utilizatori.
      </p>

      {/* Căutare și Filtrare */}
      <div className="controls">
        <input
          type="text"
          placeholder="Căutare..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {errors.search && <p className="error">{errors.search}</p>}
        <select value={filterCategory} onChange={handleFilterChange}>
          <option value="">Toate categoriile</option>
          <option value="Category A">Category A</option>
          <option value="Category B">Category B</option>
        </select>
        <button onClick={handleSortChange}>
          Sortează {sortOrder === "asc" ? "Descrescător" : "Crescător"}
        </button>
      </div>

      {/* Formular pentru adăugare */}
      <div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />
        {errors.category && <p className="error">{errors.category}</p>}

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <p className="error">{errors.description}</p>}

        <button onClick={createItem}>Add Item</button>
      </div>

      {/* Afișare listei filtrate și sortate */}
      <ul>
        {getFilteredAndSortedItems().map((item) => (
          <li key={item.id}>
            <p>
              <strong>{item.name}</strong> - {item.category}: {item.description}
            </p>
            <button onClick={() => setFormData(item)}>Edit</button>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
