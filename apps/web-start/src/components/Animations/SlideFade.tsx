function SlideFade({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`
        absolute inset-0 transition-all duration-300 ease-out
        ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
    >
      {children}
    </div>
  );
}

export { SlideFade };