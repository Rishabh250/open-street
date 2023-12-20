function Spinner({ title }) {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50">
        <div className="loader"></div>
        <p className="text-lg mt-2 text-white">{title}</p>
      </div>
    );
  }

export default Spinner;