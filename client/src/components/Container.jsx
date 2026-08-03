const Container = ({ children, className = "" }) => (
  <div className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export default Container;
