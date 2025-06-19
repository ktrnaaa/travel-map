import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useRef } from "react";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: "Ім'я",
    lastName: "Прізвище",
    middleName: "По батькові",
    location: "Місце",
    email: "test@gmail.com",
    phone: "38 (099) 999 99 99",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [focusedField, setFocusedField] = useState(null);


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

    // Перевірка розміру файлу (до 10 МБ)
    if (file.size > 10 * 1024 * 1024) {
      setError("Розмір файлу повинен бути менше 10 МБ");
      return;
    }

    // Перевірка типу файлу
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError("Дозволені лише JPG/PNG файли");
      return;
    }

    setAvatar(file);
    setError(null);

    // Створення попереднього перегляду
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
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
      
      // Додаємо текстові дані
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Додаємо аватар
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      
      const response = await axios.post('http://localhost:4000/profileChanges', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Помилка при відправці даних:", error);
      setError("Помилка при збереженні даних. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <h2 className="text-3xl font-bold text-[#744ce9] mb-8">Персональні дані</h2>

    <form onSubmit={handleSubmit}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex items-start space-x-8">
          {/* Ліва частина з аватаром + кнопка завантаження фото */}
          <div className="w-1/4">
            <motion.div 
              className="bg-[#F4EFFF] rounded-full w-40 h-40 flex items-center justify-center mb-4 overflow-hidden m-auto"
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#744ce9] text-4xl">ІП</span>
              )}
            </motion.div>

            {/* Кнопка додавання фото */}
            <motion.div 
              className="border-2 border-dashed border-[#744ce9] rounded-lg p-4 bg-[#F4EFFF] mb-6"
            >
              <h4 className="text-sm font-semibold text-[#744ce9] mb-1">Додати фото</h4>
              <p className="text-xs text-gray-500 mb-2">Jpg, png, розміром від 600×600 пікселів, до 10 МБ</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg, image/png"
                className="hidden"
              />
              <motion.button 
                type="button"
                onClick={triggerFileInput}
                whileTap={{ scale: 0.95 }}
                className="bg-[#744ce9] border-2 border-[#744ce9] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#F4EFFF] hover:text-[#744ce9] transition-all"
              >
                {avatar ? "Змінити фото" : "Завантажити"}
              </motion.button>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mt-2"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Права частина з інпутами та Google акаунтом */}
          <div className="w-3/4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "firstName", label: "Ім'я" },
                { name: "lastName", label: "Прізвище" },
                { name: "middleName", label: "По батькові" },
                { name: "location", label: "Місце" },
                { name: "email", label: "Email" },
                { name: "phone", label: "Телефон" },
              ].map(({ name, label }) => (
                <motion.div key={name}>
                  <div className="relative w-full">
                    <motion.label
                      htmlFor={name}
                      animate={{
                        scale: focusedField === name ? 1.05 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="block text-sm text-gray-500 mb-1"
                    >
                      {label}
                    </motion.label>
                    <input
                      id={name}
                      type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
                      name={name}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      onFocus={() => setFocusedField(name)}
                      onBlur={() => setFocusedField(null)}
                      className="peer w-full p-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div className="bg-[#F3F3F3] rounded-lg p-6">
              <h4 className="text-lg font-semibold text-[#744ce9] mb-4">Авторизуйтесь в один клік</h4>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-2 bg-white #F4EFFF text-[#744ce9] px-4 py-2 rounded-lg 
                hover:bg-[#744ce9] hover:text-white transition-colors duration-200 w-full"
              >
                <span>Прив&apos;язати Google акаунт</span>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Кнопка відправки та статус */}
        <div className="mt-8 flex justify-end items-center space-x-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-600 font-medium"
            >
              {error}
            </motion.div>
          )}
          
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-600 font-medium"
            >
              Зміни успішно збережено!
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-6 py-2 rounded-lg transition-all ${
              isSubmitting 
                ? "bg-indigo-400 cursor-not-allowed" 
                : "bg-[#744ce9] text-white"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Збереження...
              </div>
            ) : (
              "Зберегти зміни"
            )}
          </motion.button>
        </div>
      </motion.div>
    </form>
  </div>
  );
}

export default ProfilePage;