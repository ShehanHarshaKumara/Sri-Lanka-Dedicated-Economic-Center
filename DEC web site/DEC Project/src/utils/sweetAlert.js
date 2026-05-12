import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const baseOptions = {
  confirmButtonColor: '#16a34a',
  cancelButtonColor: '#64748b',
  background: '#ffffff',
  color: '#1f2937',
  customClass: {
    popup: 'rounded-3xl',
    confirmButton: 'rounded-xl px-5 py-2.5 font-semibold',
    cancelButton: 'rounded-xl px-5 py-2.5 font-semibold'
  }
};

export const showSuccessAlert = (title, text = '') =>
  Swal.fire({
    ...baseOptions,
    icon: 'success',
    title,
    text,
    timer: 2200,
    timerProgressBar: true
  });

export const showErrorAlert = (title, text = '') =>
  Swal.fire({
    ...baseOptions,
    icon: 'error',
    title,
    text
  });

export const showWarningAlert = (title, text = '') =>
  Swal.fire({
    ...baseOptions,
    icon: 'warning',
    title,
    text
  });

export const confirmAction = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes, continue',
  cancelButtonText = 'Cancel',
  icon = 'warning',
  confirmButtonColor = '#dc2626'
} = {}) => {
  const result = await Swal.fire({
    ...baseOptions,
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor
  });

  return result.isConfirmed;
};
