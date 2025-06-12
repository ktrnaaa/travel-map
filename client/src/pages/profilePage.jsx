import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useRef } from "react";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: "Андрій",
    lastName: "Стегній",
    middleName: "",
    location: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
      
      // Додаємо аватар, якщо він є
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
            {/* Ліва частина з аватаром та полями */}
            <div className="w-1/4">
              <motion.div 
                className="bg-[#F4EFFF] rounded-full w-40 h-40 flex items-center justify-center mb-4 overflow-hidden"
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#744ce9] text-4xl">АС</span>
                )}
              </motion.div>
              
              <div className="mb-6 space-y-4">
                {["firstName", "lastName", "middleName", "location"].map((field) => (
                  <motion.div 
                    key={field}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <label className="block text-sm text-gray-500 mb-1">
                      {field === "firstName" && "Ім'я"}
                      {field === "lastName" && "Прізвище"}
                      {field === "middleName" && "По батькові"}
                      {field === "location" && "Місце"}
                    </label>
                    <input 
                      type="text" 
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full p-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-2 text-[#744ce9]">
                <p>test@gmail.com</p>
                <p>38 (099) 999 99 99</p>
              </div>
            </div>

            {/* Права частина з фото та Google акаунтом */}
            <div className="w-3/4">
              <motion.div 
                className="border-2 border-dashed border-[#4DDB80] rounded-lg p-6 mb-6 bg-[#C4FEDB]"
              >
                <h4 className="text-lg font-semibold text-[#40b96d] mb-2">Додати фото</h4>
                <p className="text-gray-500 text-sm mb-4">Jpg, png, розміром від 600×600 пікселів, до 10 МБ</p>
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
                  className="bg-[#4DDB80] text-white px-4 py-2 rounded-lg hover:bg-[#40b96d] transition-all"
                >
                  {avatar ? "Змінити фото" : "Завантажити"}
                </motion.button>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>

              <motion.div 
                className="bg-[#F4EFFF] rounded-lg p-6"
              >
                <h4 className="text-lg font-semibold text-[#744ce9] mb-4">Авторизуйтесь в один клік</h4>
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 bg-white #F4EFFF text-[#744ce9] px-4 py-2 rounded-lg hover:bg-indigo-50 w-full"
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
                  : "bg-[#F22F46] hover:bg-[#F22F46] text-white"
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
};

export default ProfilePage;