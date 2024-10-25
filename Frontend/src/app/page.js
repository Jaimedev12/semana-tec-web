"use client";
import { useEffect, useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { functions, auth } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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
  const [authError, setAuthError] = useState("");
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

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    console.log("Sesión cerrada");
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setAuthError("");
    } catch (error) {
      setAuthError("Error al iniciar sesión con Google.");
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
              <button onClick={handleGoogleSignIn} className="google-auth-button">Iniciar sesión con Google</button>
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