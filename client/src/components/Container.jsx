const Container = ({ children, className = "" }) => (
  <div className={`mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 ${className}`}>
    {children}
  </div>
);

export default Container;
