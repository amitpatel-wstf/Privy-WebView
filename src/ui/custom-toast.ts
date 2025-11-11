export const showSuccessToast = (message: string) => {
  console.log('✅ Success:', message);
  alert(`✅ ${message}`);
};

export const showErrorToast = (message: string) => {
  console.error('❌ Error:', message);
  alert(`❌ ${message}`);
};
