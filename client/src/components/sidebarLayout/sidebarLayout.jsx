import { BiSupport } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { FaRoute } from "react-icons/fa6";
import { FaBullhorn } from 'react-icons/fa';
import { BiLogIn } from "react-icons/bi";
import { Outlet, Link, NavLink } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";

const SidebarLayout = ({ children }) => {
  const baseLinkStyles = `
    py-2 px-4 rounded-lg flex items-center transition-all duration-200 ease-in-out
  `;

  const activeStyle = ({ isActive }) =>
    `${baseLinkStyles} ${isActive ? "bg-[#744ce9] text-white" : "text-[#797979] hover:bg-[#744CE9] hover:text-[#ffff]"}`;

  return (
    <div className="flex min-h-screen bg-[#F3F3F3]">
      <div className="fixed left-0 top-0 h-full w-64 bg-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8 text-[#744ce9]">Особистий кабінет</h1>

        <div className="mb-8">
          <p className="text-[#744ce9]">Вітаємо</p>
          <p className="text-xl text-[#744ce9] font-semibold">Користувач!</p>
        </div>

        <nav className="flex flex-col justify-between h-full">
          <div className="space-y-4">
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
            <NavLink to="/auth" className={activeStyle}>
              <BiLogIn size="25" className="mr-[5px]" /> Авторизація
            </NavLink>
          </div>

          <div className="space-y-4">
            <NavLink to="/settings" className={activeStyle}>
              <IoMdSettings size="25" className="mr-[5px]" /> Налаштування
            </NavLink>
          </div>
        </nav>
      </div>

      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
};


export default SidebarLayout;
