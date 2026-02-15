import '@testing-library/jest-dom'
import '../i18n'

if (!localStorage.getItem('vertex_locale')) {
  localStorage.setItem('vertex_locale', 'en')
}
