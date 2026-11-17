// The contact form used to submit through WordPress (admin-ajax.php), which no longer exists.
// Until a form service is connected, stop the submission and tell the visitor how to reach us.
// Replace this file when the form is wired up.
document.addEventListener('submit', (event) => {
  const form = event.target.closest('.elementor-form');
  if (!form) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!form.reportValidity()) return;
  form.querySelectorAll('.elementor-message').forEach((el) => el.remove());
  const msg = document.createElement('div');
  msg.className = 'elementor-message elementor-message-danger';
  msg.setAttribute('role', 'alert');
  msg.textContent = 'Online submissions are not available yet. Please call us to discuss your project.';
  form.appendChild(msg);
}, true);
