import toast from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description: string;
  type?: 'success' | 'error';
}

export const useToast = () => {
  return (options: ToastOptions) => {
    const { title, description, type = 'success' } = options;
    toast[type](`${title}: ${description}`);
  };
}; 