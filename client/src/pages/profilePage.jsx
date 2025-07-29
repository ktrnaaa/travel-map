import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useRef } from "react";
import { FiUpload, FiTrash, FiLogOut, FiSearch, FiArrowLeft, FiMoon, FiMessageCircle, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    location: "",
    email: "",
    phone: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [focusedField, setFocusedField] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Розмір файлу повинен бути менше 10 МБ");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError("Дозволені лише JPG/PNG/WEBP файли");
      return;
    }

    setAvatar(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      const response = await axios.post('http://localhost:4000/profileChanges', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Помилка при збереженні даних. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white rounded-lg">
      <style jsx>{`
        :focus:not(:focus-visible) {
          outline: none;
          box-shadow: none;
        }
        :focus-visible {
          outline: 2px solid #744ce9;
          outline-offset: 2px;
          border-radius: 0.375rem;
        }
      `}</style>

      {/* Топ-бар */}
      <div className="flex items-center justify-between bg-[#F4EFFF] rounded-xl px-4 py-2 mb-6 gap-4 border border-gray-300 shadow-lg">
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "#FFFFFF",
            color: "#744ce9"
          }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm bg-[#744ce9] text-white px-4 py-2 rounded-md shadow transition-all duration-50 cursor-pointer border-2 border-[#744ce9]"
        >
          <FiArrowLeft />
          Повернутись до карти
        </motion.button>

        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук..."
            className="bg-white text-sm text-gray-700 placeholder-gray-400 pl-10 pr-4 py-2 rounded-md w-full shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#744ce9] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className="text-[#744ce9] text-xl p-2 rounded cursor-pointer"
            title={darkMode ? "Світла тема" : "Темна тема"}
          >
            <FiMoon />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-[#744ce9] text-xl p-2 relative rounded cursor-pointer"
            title="Повідомлення"
          >
            <FiMessageCircle />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-[#744ce9] text-xl p-2 relative rounded cursor-pointer"
            title="Друзі"
          >
            <FiUsers />
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
          </motion.button>

          <p className="text-sm font-medium text-gray-700">Ім'я Прізвище</p>
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" className="w-8 h-8 rounded-full object-cover shadow cursor-pointer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#744ce9] text-white flex items-center justify-center text-sm font-semibold shadow cursor-pointer">ІП</div>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="text-[#744ce9] text-xl p-2 rounded cursor-pointer"
            title="Вихід"
          >
            <FiLogOut />
          </motion.button>
        </div>
      </div>
     
      <h1 className="text-3xl font-bold text-[#744ce9] mb-2">Ваш профіль</h1>
      
      <form onSubmit={handleSubmit}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="grid grid-cols-3 gap-8"
        >
          
          <div className="col-span-1 flex flex-col items-center justify-start bg-[#F4EFFF] rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-[#744ce9] mb-4 self-start">Фото профілю</h3>
            <div className="relative group w-40 h-40 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md cursor-pointer">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#744ce9] text-4xl font-semibold">ІП</span>
              )}
              <div className="absolute inset-x-0 bottom-[-0.1%] h-2/6 bg-[#744ce966] opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-4">
                <button 
                  type="button" 
                  onClick={triggerFileInput} 
                  className="text-white text-xl cursor-pointer"
                >
                  <FiUpload />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatar(null);
                    setAvatarPreview(null);
                    fileInputRef.current.value = null;
                  }}
                  className="text-white text-xl cursor-pointer"
                >
                  <FiTrash />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Підтримка: JPG, PNG, WEBP. До 10 МБ</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/jpeg, image/png, image/webp" 
              className="hidden" 
            />
            <p className="text-center text-sm text-gray-400 mt-4">Ваш ID: 22222</p>
            <p className="text-center text-sm text-gray-400">Дата реєстрації: 2024-06-20</p>
          </div>

          <div className="col-span-2 space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-semibold text-[#744ce9]">Особисті дані</h3>
            <p className="text-sm text-gray-500 mb-4">Заповніть інформацію про себе</p>
            
            <div className="grid grid-cols-2 gap-4">
              {["firstName", "lastName", "middleName", "location", "email", "phone"].map((name) => (
                <div key={name} className="relative w-full">
                  <label htmlFor={name} className="block text-sm text-gray-500 mb-1">
                    {name === "firstName" ? "Ім'я" : name === "lastName" ? "Прізвище" : name === "middleName" ? "По батькові" : name === "location" ? "Місце" : name === "email" ? "Email" : "Телефон"}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
                    placeholder={`Уведіть ваше ${name === "firstName" ? "ім'я" : name === "lastName" ? "прізвище" : name === "middleName" ? "по батькові" : name === "location" ? "місце проживання" : name === "email" ? "email" : "телефон"}`}
                    value={formData[name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(name)}
                    onBlur={() => setFocusedField(null)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end items-center gap-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {isSuccess && <p className="text-green-600 text-sm">Зміни успішно збережено!</p>}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-6 py-2 rounded-lg transition-all ${
                  isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-[#744ce9] text-white"
                } focus:outline-none focus:ring-2 focus:ring-[#744ce9] focus:ring-offset-2 cursor-pointer`}
              >
                {isSubmitting ? "Збереження..." : "Зберегти зміни"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default ProfilePage;