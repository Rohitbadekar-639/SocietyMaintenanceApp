export const AI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
]

export function AiLanguageSelect({ value, onChange, disabled = false, id = 'ai-language', className = '' }) {
  return (
    <select
      id={id}
      className={`input ${className}`.trim()}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      aria-label="AI language"
    >
      {AI_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}
