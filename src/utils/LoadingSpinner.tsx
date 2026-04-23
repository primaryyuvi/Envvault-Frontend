const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

export default LoadingSpinner;