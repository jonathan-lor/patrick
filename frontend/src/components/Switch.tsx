interface Props{
  checked: boolean
  name?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export default function Switch({
  checked,
  name,
  onChange,
  disabled,
}: Props){
  return (
    <>
      <label className={`switch-label ${disabled ? "disabled" : ""}`} htmlFor={name}>
        <input className="switch-input" type="checkbox" id={name} checked={checked} onChange={onChange} disabled={disabled} />
        <span className="switch-slider"></span>
      </label>
    </>
  )
}