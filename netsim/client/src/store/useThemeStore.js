import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('netsim-theme') || 
         (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('netsim-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  
  initTheme: () => set((state) => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return state;
  })
}));

export default useThemeStore;
