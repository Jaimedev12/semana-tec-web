"use client";
import { useEffect, useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { functions, auth } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import ListOfAccounts from "./listOfAccounts";
import AddAccountForm from "./addAccountForm";

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
  const [isRegistering, setIsRegistering] = useState(false);
  const [accounts, setAccounts] = useState([]);

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

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        try {
          const result = await getAllAccountsFromUserFunction({});
          setAccounts(result.data);
        } catch (error) {
          console.error("Error fetching accounts:", error);
        }
      }
    };

    fetchAccounts();
  }, [user]);

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

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      setUser(userCredential.user);
      setAuthError("");
      setIsRegistering(false);
    } catch (error) {
      setAuthError("Error de registro: Verifique sus datos.");
    }
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
              {isRegistering ? (
                <>
                  <button onClick={handleRegister} className="register-button">Registrar</button>
                  <button onClick={() => setIsRegistering(false)} className="toggle-auth-button">Ya tengo cuenta</button>
                </>
              ) : (
                <>
                  <button onClick={handleLogin} className="login-button">Iniciar Sesión</button>
                  <button onClick={() => setIsRegistering(true)} className="toggle-auth-button">Registrarse</button>
                </>
              )}
              {authError && <p className="auth-error">{authError}</p>}
            </>
          )}
        </div>
      </header>

      <div className="content">
        {user ? (
          <>
            <AddAccountForm accounts={accounts} setAccounts={setAccounts} />
            <ListOfAccounts accounts={accounts} setAccounts={setAccounts} />
          </>
        ) : (
          <p>Por favor, inicie sesión para ver sus contraseñas.</p>
        )}
      </div>
    </div>
  );
}