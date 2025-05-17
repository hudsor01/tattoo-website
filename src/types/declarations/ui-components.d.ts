// Type declarations for UI components

// shadcn/ui component types
declare module '@/components/ui/*' {
  const component: any;
  export default component;
  export * from 'component';
}

// Export required to make this a module
export {};
