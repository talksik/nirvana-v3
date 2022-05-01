export default function IconButton({ children }) {
  return (
    <button className="bg-gray-800 shadow-md h-7 w-7 text-white text-xs flex items-center justify-center">
      {children}
    </button>
  );
}
