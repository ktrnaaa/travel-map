import { BiSupport } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { FaRoute } from "react-icons/fa6";
import { FaBullhorn } from 'react-icons/fa';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { RiLogoutBoxLine } from "react-icons/ri"


const SidebarLayout = ({ children }) => {
  const activeStyle = ({isActive}) => isActive ? "bg-[#F4EFFF] text-[#744ce9] border" : "bg-none";

  return (
    <div className="flex min-h-screen bg-[#F3F3F3]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Особистий кабінет</h1>
        
        <div className="mb-8">
          <p className="text-[#744ce9]">Вітаємо</p>
          <p className="text-xl font-semibold">Користувач!</p>
        </div>
        
        <nav className="flex flex-col justify-between h-full">
          {/* Верхні елементи меню */}
          <div className="space-y-4 text-[#797979]
            [&>a]:py-2 [&>a]:px-4 [&>a]:rounded-lg
            [&>a]:transition-all [&>a]:duration-200 [&>a]:ease-in-out
            [&>a]:flex [&>a]:items-center
            [&>a:hover]:bg-[#744ce9] [&>a:hover]:text-white">
            
            <NavLink to="/profile" className={activeStyle}>
              <CgProfile size="27" className="mr-[5px]" /> Профіль
            </NavLink>
            <NavLink to="/announcements" className={activeStyle}>
              <FaBullhorn size="25" className="mr-[5px]" /> Оголошення
            </NavLink>
            <NavLink to="/routes" className={activeStyle}>
              <FaRoute size="25" className="mr-[5px]" /> Маршрути
            </NavLink>
            <NavLink to="/support" className={activeStyle}>
              <BiSupport size="25" className="mr-[5px]" /> Підтримка
            </NavLink>
          </div>

          {/* Нижні елементи меню */}
          <div className="space-y-4 text-[#797979]
            [&>a]:py-2 [&>a]:px-4 [&>a]:rounded-lg
            [&>a]:transition-all [&>a]:duration-200 [&>a]:ease-in-out
            [&>a]:flex [&>a]:items-center
            [&>a:not(:last-child):hover]:bg-[#744ce9] [&>a:not(:last-child):hover]:text-white">
            
            <NavLink to="/settings" className={activeStyle}>
              <IoMdSettings size="25" className="mr-[5px]" /> Налаштування
            </NavLink>
            <NavLink to="/logout" className="text-[#F22F46] hover:bg-[#F22F46] hover:text-white">
              <RiLogoutBoxLine size="25" className="mr-[5px]" /> Вихід
            </NavLink>
          </div>
        </nav>

      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;