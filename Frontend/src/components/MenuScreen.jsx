import { useMenuStore } from "../store/menuStore";
import React from 'react'

const Menu = () => {
  const isOpen = useMenuStore((state) => state.isOpen);
  const closeMenu = useMenuStore((state) => state.closeMenu);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
          onClick={closeMenu}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          menu bos!
        </h2>
        <p className="text-gray-600 leading-relaxed">
          This is a clean and user-friendly modal. You can customize the content here to suit your needs.
        </p>
      </div>
    </div>
  );
};

export default Menu;
