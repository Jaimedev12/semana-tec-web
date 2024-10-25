"use client";
import { useEffect, useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { functions, auth } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newAccount, setNewAccount] = useState({ name: "", email: "", password: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingAccountIndex, setEditingAccountIndex] = useState(null);
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Firebase Functions
  const addAccountFunction = httpsCallable(functions, "addAccount");
  const editAccountFunction = httpsCallable(functions, "editAccount");
  const getAllAccountsFromUserFunction = httpsCallable(functions, "getAllAccountsFromUser");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchAllAccounts();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const togglePasswordVisibility = (category, index) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [`${category}-${index}`]: !prev[`${category}-${index}`],
    }));
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAccordionToggle = (category, index) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [`${category}-${index}`]: !prev[`${category}-${index}`],
    }));
  };

  // Función para agregar categorías
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories((prevCategories) => [
        ...prevCategories,
        { category: newCategory, accounts: [] },
      ]);
      setNewCategory("");
    }
  };

  // Función para agregar cuentas
  const handleAddAccount = async () => {
    if (selectedCategory && user) {
      try {
        const result = await addAccountFunction({
          username: newAccount.email,
          password: newAccount.password,
        });
        console.log("Account added:", result.data);

        const updatedCategories = categories.map((categoryData) => {
          if (categoryData.category === selectedCategory.category) {
            return {
              ...categoryData,
              accounts: [
                ...categoryData.accounts,
                { name: newAccount.name, email: newAccount.email, password: newAccount.password },
              ],
            };
          }
          return categoryData;
        });
        setCategories(updatedCategories);
        setNewAccount({ name: "", email: "", password: "" });
      } catch (error) {
        console.error("Error adding account:", error);
      }
    } else {
      console.log("Usuario no autenticado");
    }
  };

  const handleEditAccount = (index) => {
    const accountToEdit = selectedCategory.accounts[index];
    setNewAccount(accountToEdit);
    setIsEditing(true);
    setEditingAccountIndex(index);
  };

  const handleUpdateAccount = async () => {
    if (selectedCategory && editingAccountIndex !== null && user) {
      try {
        const accountToEdit = selectedCategory.accounts[editingAccountIndex];
        const result = await editAccountFunction({
          id: accountToEdit.id,
          username: newAccount.email,
          password: newAccount.password,
        });
        console.log("Account updated:", result.data);

        const updatedCategories = categories.map((categoryData) => {
          if (categoryData.category === selectedCategory.category) {
            const updatedAccounts = [...categoryData.accounts];
            updatedAccounts[editingAccountIndex] = newAccount;
            return { ...categoryData, accounts: updatedAccounts };
          }
          return categoryData;
        });
        setCategories(updatedCategories);
        setNewAccount({ name: "", email: "", password: "" });
        setIsEditing(false);
        setEditingAccountIndex(null);
      } catch (error) {
        console.error("Error updating account:", error);
      }
    } else {
      console.log("Usuario no autenticado");
    }
  };

  const fetchAllAccounts = async () => {
    if (user) {
      try {
        const result = await getAllAccountsFromUserFunction({});
        const accounts = result.data;
        const categoriesData = {};

        accounts.forEach((account) => {
          const { category, name, email, password } = account;
          if (!categoriesData[category]) {
            categoriesData[category] = { category, accounts: [] };
          }
          categoriesData[category].accounts.push({ name, email, password });
        });

        setCategories(Object.values(categoriesData));
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    } else {
      console.log("Usuario no autenticado");
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setUser(userCredential.user);
      setAuthError("");
    } catch (error) {
      setAuthError("Error de autenticación: Verifique sus credenciales.");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    console.log("Sesión cerrada");
  };

  return (
    <div className="password-manager">
      <header className="header">
        <h1>Lock Keeper</h1>
        <div className="user-info">
          {user ? (
            <>
              <span>{user.email}</span>
              <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="auth-input"
              />
              <button onClick={handleLogin} className="login-button">Iniciar Sesión</button>
              {authError && <p className="auth-error">{authError}</p>}
            </>
          )}
        </div>
      </header>

      <div className="content">
        {user ? (
          <>
            <div className="categories">
              <h2>Categorías</h2>
              <ul>
                {categories.map((categoryData, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleCategoryClick(categoryData)}
                      className="category-button"
                    >
                      {categoryData.category}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="add-category">
                <input
                  type="text"
                  placeholder="Nueva categoría"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-new-category"
                />
                <button onClick={handleAddCategory} className="add-category-button">
                  Añadir Categoría
                </button>
              </div>
            </div>

            <div className="accounts">
              {selectedCategory && (
                <>
                  <div className="add-account">
                    <h3>{isEditing ? "Editar Contraseña" : "Añadir Contraseña"}</h3>
                    <input
                      type="text"
                      placeholder="Nombre de la cuenta"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      className="input-new-account"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newAccount.email}
                      onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                      className="input-new-account"
                    />
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                      className="input-new-account"
                    />
                    <button onClick={isEditing ? handleUpdateAccount : handleAddAccount} className="add-account-button">
                      {isEditing ? "Actualizar Contraseña" : "Añadir Contraseña"}
                    </button>
                  </div>

                  <Accordion>
                    {selectedCategory.accounts.map((account, accIndex) => (
                      <AccordionItem
                        key={accIndex}
                        title={account.name}
                        onClick={() => handleAccordionToggle(selectedCategory.category, accIndex)}
                      >
                        <p>Email: {account.email}</p>
                        <p onClick={() => togglePasswordVisibility(selectedCategory.category, accIndex)} style={{ cursor: 'pointer' }}>
                          {visiblePasswords[`${selectedCategory.category}-${accIndex}`] ? account.password : "*****"}
                        </p>
                        <button onClick={() => handleEditAccount(accIndex)} className="edit-button">Editar</button>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </>
              )}
            </div>
          </>
        ) : (
          <p>Por favor, inicie sesión para ver sus contraseñas.</p>
        )}
      </div>
    </div>
  );
}